import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createCalendarEvent } from '@/lib/google/calendar'
import { sendBookingConversion } from '@/lib/conversion-tracking/google-ads'
import { z } from 'zod'

// Validation schema for creating bookings
const createBookingSchema = z.object({
  eventTypeId: z.string().min(1, 'Event type ID is required'),
  startTime: z.string().datetime('Invalid start time format'),
  endTime: z.string().datetime('Invalid end time format'),
  attendeeName: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  attendeeEmail: z.string().email('Invalid email address'),
  attendeePhone: z.string().optional(),
  timezone: z.string().default('Europe/Berlin'),
  customFields: z.record(z.string(), z.any()).optional(),
  utmParams: z.record(z.string(), z.string()).optional(), // For tracking
  gclid: z.string().optional(), // Google Ads Click ID
  gbraid: z.string().optional(), // Google Ads Conversion tracking
  wbraid: z.string().optional(), // Google Ads Conversion tracking
})

/**
 * POST /api/bookings
 * Creates a new booking and Google Calendar event
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validationResult = createBookingSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Fetch event type with user
    const eventType = await prisma.eventType.findUnique({
      where: { id: data.eventTypeId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            googleIntegration: {
              select: {
                active: true,
              },
            },
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

    // Check if Google Calendar is connected
    if (!eventType.user.googleIntegration?.active) {
      return NextResponse.json(
        {
          error: 'Calendar integration not available',
          message: 'The event owner has not connected their Google Calendar.',
        },
        { status: 424 }
      )
    }

    // Parse dates
    const startTime = new Date(data.startTime)
    const endTime = new Date(data.endTime)

    // Validate times
    if (startTime >= endTime) {
      return NextResponse.json(
        { error: 'Start time must be before end time' },
        { status: 400 }
      )
    }

    if (startTime < new Date()) {
      return NextResponse.json(
        { error: 'Cannot book slots in the past' },
        { status: 400 }
      )
    }

    // Check duration matches event type
    const duration = (endTime.getTime() - startTime.getTime()) / 60000 // minutes
    if (duration !== eventType.duration) {
      return NextResponse.json(
        {
          error: 'Invalid duration',
          message: `Expected ${eventType.duration} minutes, got ${duration} minutes`,
        },
        { status: 400 }
      )
    }

    // Check if slot is still available (prevent double booking)
    const existingBooking = await prisma.booking.findFirst({
      where: {
        eventTypeId: data.eventTypeId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    })

    if (existingBooking) {
      return NextResponse.json(
        {
          error: 'Slot not available',
          message: 'This time slot has already been booked. Please select a different time.',
        },
        { status: 409 }
      )
    }

    // If event requires confirmation, create pending booking
    const bookingStatus = eventType.requiresConfirmation ? 'PENDING' : 'CONFIRMED'

    // Create booking in database first
    const booking = await prisma.booking.create({
      data: {
        userId: eventType.userId,
        eventTypeId: data.eventTypeId,
        guestName: data.attendeeName,
        guestEmail: data.attendeeEmail,
        guestPhone: data.attendeePhone,
        startTime,
        endTime,
        timezone: data.timezone,
        customFieldsData: data.customFields || {},
        status: bookingStatus,
      },
      include: {
        eventType: {
          select: {
            id: true,
            title: true,
            description: true,
            duration: true,
            slug: true,
          },
        },
      },
    })

    let calendarEventId: string | undefined
    let meetLink: string | undefined

    // Create Google Calendar event if booking is confirmed
    if (bookingStatus === 'CONFIRMED') {
      try {
        const calendarEvent = await createCalendarEvent(eventType.userId, {
          summary: `${eventType.title} - ${data.attendeeName}`,
          description: `Booking via BookingSaaS

Event: ${eventType.title}
${eventType.description ? `Description: ${eventType.description}\n` : ''}
Attendee: ${data.attendeeName}
Email: ${data.attendeeEmail}
${data.attendeePhone ? `Phone: ${data.attendeePhone}\n` : ''}
Timezone: ${data.timezone}

Booking ID: ${booking.id}`,
          startTime,
          endTime,
          attendees: [data.attendeeEmail],
          timezone: data.timezone,
        })

        calendarEventId = calendarEvent.eventId || undefined
        meetLink = calendarEvent.meetLink || undefined

        // Update booking with calendar event details
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            googleEventId: calendarEventId,
            googleMeetLink: meetLink,
          },
        })
      } catch (calendarError) {
        console.error('Failed to create calendar event:', calendarError)
        // Don't fail the booking if calendar creation fails
        // The event owner can manually add it later
      }
    }

    // Create tracking data if UTM/GCLID params present
    if (data.utmParams || data.gclid || data.gbraid || data.wbraid) {
      try {
        await prisma.trackingData.create({
          data: {
            bookingId: booking.id,
            gclid: data.gclid,
            gbraid: data.gbraid,
            wbraid: data.wbraid,
            utmSource: data.utmParams?.utm_source,
            utmMedium: data.utmParams?.utm_medium,
            utmCampaign: data.utmParams?.utm_campaign,
            utmTerm: data.utmParams?.utm_term,
            utmContent: data.utmParams?.utm_content,
            conversionSent: false, // Will be sent by tracking service
          },
        })

        // Send conversion to Google Ads (CONTINUOUS mode only, for CONFIRMED bookings)
        if (bookingStatus === 'CONFIRMED' && data.gclid) {
          try {
            // Check if tracking is in CONTINUOUS mode
            const trackingSettings = await prisma.trackingSettings.findUnique({
              where: { userId: eventType.userId },
              select: { trackingMode: true, googleAdsEnabled: true }
            })

            if (trackingSettings?.googleAdsEnabled && trackingSettings.trackingMode === 'CONTINUOUS') {
              // Send conversion asynchronously (don't block booking creation)
              sendBookingConversion(booking.id).catch((error) => {
                console.error('Failed to send conversion (non-blocking):', error)
              })
            }
          } catch (trackingCheckError) {
            console.error('Failed to check tracking settings:', trackingCheckError)
            // Don't fail booking if tracking check fails
          }
        }
      } catch (trackingError) {
        console.error('Failed to create tracking data:', trackingError)
        // Don't fail booking if tracking fails
      }
    }

    // TODO: Send confirmation email to attendee and event owner
    // This would be implemented with Resend or similar service

    // Format response
    const response = {
      booking: {
        id: booking.id,
        eventType: {
          title: booking.eventType.title,
          description: booking.eventType.description,
          duration: booking.eventType.duration,
          slug: booking.eventType.slug,
        },
        attendeeName: booking.guestName,
        attendeeEmail: booking.guestEmail,
        startTime: booking.startTime.toISOString(),
        endTime: booking.endTime.toISOString(),
        timezone: booking.timezone,
        status: booking.status,
        meetLink: meetLink || booking.googleMeetLink,
        createdAt: booking.createdAt.toISOString(),
      },
      message:
        bookingStatus === 'CONFIRMED'
          ? 'Booking confirmed! Check your email for details.'
          : 'Booking submitted! You will receive a confirmation email once approved.',
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('POST /api/bookings error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create booking',
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/bookings
 * Returns bookings for the authenticated user (event owner)
 */
export async function GET(request: NextRequest) {
  try {
    // This endpoint is for authenticated event owners to view their bookings
    // It would require session authentication (not implemented in this example)
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  } catch (error) {
    console.error('GET /api/bookings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
