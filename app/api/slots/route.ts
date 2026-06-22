import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAvailableSlots } from '@/lib/google/calendar'
import { z } from 'zod'

// Validation schema for query parameters
const slotsQuerySchema = z.object({
  eventTypeId: z.string().min(1, 'Event type ID is required'),
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format'),
})

/**
 * GET /api/slots
 * Returns available time slots for booking based on Google Calendar freebusy
 *
 * Query Parameters:
 * - eventTypeId: The event type to get slots for
 * - startDate: ISO 8601 datetime string (e.g., "2024-01-15T00:00:00Z")
 * - endDate: ISO 8601 datetime string (e.g., "2024-01-15T23:59:59Z")
 *
 * Example: /api/slots?eventTypeId=abc123&startDate=2024-01-15T00:00:00Z&endDate=2024-01-15T23:59:59Z
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const params = {
      eventTypeId: searchParams.get('eventTypeId'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
    }

    // Validate query parameters
    const validationResult = slotsQuerySchema.safeParse(params)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const { eventTypeId, startDate, endDate } = validationResult.data

    // Fetch event type
    const eventType = await prisma.eventType.findUnique({
      where: { id: eventTypeId },
      include: {
        user: {
          include: {
            googleIntegration: true,
          },
        },
      },
    })

    if (!eventType) {
      return NextResponse.json(
        { error: 'Event type not found' },
        { status: 404 }
      )
    }

    if (!eventType.active) {
      return NextResponse.json(
        { error: 'Event type is not active' },
        { status: 403 }
      )
    }

    // Check if user has Google Calendar integration
    if (!eventType.user.googleIntegration) {
      return NextResponse.json(
        {
          error: 'Google Calendar integration not configured',
          message:
            'The event owner has not connected their Google Calendar. Please contact them.',
        },
        { status: 424 } // Failed Dependency
      )
    }

    if (!eventType.user.googleIntegration.active) {
      return NextResponse.json(
        {
          error: 'Google Calendar integration is inactive',
          message:
            'The event owner\'s Google Calendar connection is inactive. Please contact them.',
        },
        { status: 424 }
      )
    }

    // Parse dates
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Validate date range
    if (start >= end) {
      return NextResponse.json(
        { error: 'Start date must be before end date' },
        { status: 400 }
      )
    }

    // Limit date range to prevent abuse (max 7 days)
    const maxRange = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    if (end.getTime() - start.getTime() > maxRange) {
      return NextResponse.json(
        { error: 'Date range cannot exceed 7 days' },
        { status: 400 }
      )
    }

    // Get available slots from Google Calendar
    const slots = await getAvailableSlots(
      eventType.userId,
      start,
      end,
      eventType.duration,
      eventType.bufferTime
    )

    // Filter out past slots
    const now = new Date()
    const availableSlots = slots.filter((slot) => slot.start > now)

    // Format response
    const formattedSlots = availableSlots.map((slot) => ({
      start: slot.start.toISOString(),
      end: slot.end.toISOString(),
      duration: eventType.duration,
      available: true,
    }))

    return NextResponse.json(
      {
        eventType: {
          id: eventType.id,
          title: eventType.title,
          duration: eventType.duration,
          bufferTime: eventType.bufferTime,
        },
        dateRange: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
        slots: formattedSlots,
        totalSlots: formattedSlots.length,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/slots error:', error)

    // Handle specific errors
    if (error instanceof Error) {
      if (
        error.message.includes('Google Calendar integration not found') ||
        error.message.includes('inactive')
      ) {
        return NextResponse.json(
          {
            error: 'Calendar integration error',
            message: error.message,
          },
          { status: 424 }
        )
      }

      if (error.message.includes('Failed to fetch available slots')) {
        return NextResponse.json(
          {
            error: 'Failed to fetch calendar availability',
            message:
              'Could not retrieve available time slots. Please try again later.',
          },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
