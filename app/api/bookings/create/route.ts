import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createCalendarEvent } from '@/lib/google/calendar'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { startTime, endTime, attendeeEmail, attendeeName, eventTitle, eventDescription } = body

    if (!startTime || !endTime || !attendeeEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: startTime, endTime, attendeeEmail' },
        { status: 400 }
      )
    }

    // Check if user has Google Calendar integration
    const integration = await prisma.googleIntegration.findUnique({
      where: { userId: session.user.id },
    })

    if (!integration || !integration.active) {
      return NextResponse.json(
        { error: 'Google Calendar not connected' },
        { status: 403 }
      )
    }

    // Create calendar event using existing integration
    const result = await createCalendarEvent(
      session.user.id,
      {
        summary: eventTitle || '30min Beratungsgespräch',
        description: eventDescription || 'Booking via dabrock.ai',
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        attendees: [attendeeEmail],
      }
    )

    // Get or create default event type
    let eventType = await prisma.eventType.findFirst({
      where: { userId: session.user.id },
    })

    if (!eventType) {
      eventType = await prisma.eventType.create({
        data: {
          userId: session.user.id,
          title: eventTitle || '30min Beratungsgespräch',
          slug: `${session.user.id}-default`,
          duration: 30,
        },
      })
    }

    // Save booking to database
    const booking = await prisma.booking.create({
      data: {
        eventTypeId: eventType.id,
        userId: session.user.id,
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
      },
    })
  } catch (error: any) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking', details: error.message },
      { status: 500 }
    )
  }
}
