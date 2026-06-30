import { NextRequest, NextResponse } from 'next/server'
import { createCalendarEvent } from '@/lib/google/calendar'
import { prisma } from '@/lib/db'

/**
 * Public booking endpoint for external widgets
 * Allows anonymous users to book appointments
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { startTime, endTime, attendeeEmail, attendeeName, eventTitle, eventDescription, userId } = body

    // Validate required fields
    if (!startTime || !endTime || !attendeeEmail || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: startTime, endTime, attendeeEmail, userId' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(attendeeEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if user has Google Calendar integration
    const integration = await prisma.googleIntegration.findUnique({
      where: { userId },
    })

    if (!integration || !integration.active) {
      return NextResponse.json(
        { error: 'Calendar integration not available' },
        { status: 503 }
      )
    }

    // Create calendar event
    const result = await createCalendarEvent(
      userId,
      {
        summary: eventTitle || '30min Beratungsgespräch',
        description: eventDescription || `Booking from ${attendeeName || attendeeEmail}\n\nBooked via dabrock.ai`,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        attendees: [attendeeEmail],
      }
    )

    // Get or create default event type
    let eventType = await prisma.eventType.findFirst({
      where: { userId, active: true },
    })

    if (!eventType) {
      eventType = await prisma.eventType.create({
        data: {
          userId,
          title: eventTitle || '30min Beratungsgespräch',
          slug: `${userId}-default`,
          duration: 30,
          active: true,
        },
      })
    }

    // Save booking to database
    const booking = await prisma.booking.create({
      data: {
        eventTypeId: eventType.id,
        userId,
        guestEmail: attendeeEmail,
        guestName: attendeeName || 'Guest',
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        googleEventId: result.eventId!,
        googleMeetLink: result.meetLink || '',
        status: 'CONFIRMED',
      },
    })

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        eventId: result.eventId,
        eventLink: result.htmlLink,
        meetLink: result.meetLink,
        startTime: booking.startTime.toISOString(),
        endTime: booking.endTime.toISOString(),
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
      },
    })
  } catch (error: any) {
    console.error('Error creating public booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking', details: error.message },
      { status: 500 }
    )
  }
}
