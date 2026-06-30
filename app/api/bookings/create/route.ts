import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createCalendarEvent } from '@/lib/google-calendar'
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

    // Get user's Google account
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'google',
      },
    })

    if (!account || !account.access_token || !account.refresh_token) {
      return NextResponse.json(
        { error: 'Google Calendar not connected' },
        { status: 403 }
      )
    }

    // Create calendar event
    const result = await createCalendarEvent(
      account.access_token,
      account.refresh_token,
      {
        summary: eventTitle || '30min Beratungsgespräch',
        description: eventDescription || 'Booking via dabrock.ai',
        start: new Date(startTime),
        end: new Date(endTime),
        attendees: [attendeeEmail],
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
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
        googleMeetLink: result.meetLink || result.conferenceData?.entryPoints?.[0]?.uri,
        status: 'CONFIRMED',
      },
    })

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        eventId: result.eventId,
        eventLink: result.eventLink,
        meetLink: result.meetLink || result.conferenceData?.entryPoints?.[0]?.uri,
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
