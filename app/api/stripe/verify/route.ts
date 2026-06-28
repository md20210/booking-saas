import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createCalendarEvent } from '@/lib/google/calendar'
import { createOutlookCalendarEvent } from '@/lib/calendar/outlook'
import { sendBookingConversion } from '@/lib/conversion-tracking/google-ads'
import Stripe from 'stripe'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 })
    }

    const stripeApiKey = process.env.STRIPE_SECRET_KEY
    if (!stripeApiKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const stripe = new Stripe(stripeApiKey, {
      apiVersion: '2026-06-24.dahlia',
      typescript: true,
    })

    // Retrieve the Checkout Session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session.metadata?.bookingId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
    }

    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: { id: session.metadata.bookingId },
      include: {
        eventType: {
          include: {
            user: {
              include: {
                googleIntegration: true,
                outlookIntegration: true,
              },
            },
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if payment was successful
    if (session.payment_status === 'paid' && booking.paymentStatus !== 'SUCCEEDED') {
      // Update booking status
      const updatedBooking = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'SUCCEEDED',
          stripePaymentIntentId: session.payment_intent as string,
          paidAt: new Date(),
        },
      })

      // Create calendar events
      let googleEventId: string | undefined
      let googleMeetLink: string | undefined
      let outlookEventId: string | undefined
      let teamsMeetLink: string | undefined

      const eventDescription = `Booking via BookingSaaS

Event: ${booking.eventType.title}
${booking.eventType.description ? `Description: ${booking.eventType.description}\n` : ''}
Attendee: ${booking.guestName}
Email: ${booking.guestEmail}
${booking.guestPhone ? `Phone: ${booking.guestPhone}\n` : ''}
Timezone: ${booking.timezone}

Booking ID: ${booking.id}
Payment: ${booking.paymentCurrency} ${booking.paymentAmount}`

      // Google Calendar
      if (booking.eventType.user.googleIntegration?.active) {
        try {
          const calendarEvent = await createCalendarEvent(booking.eventType.userId, {
            summary: `${booking.eventType.title} - ${booking.guestName}`,
            description: eventDescription,
            startTime: booking.startTime,
            endTime: booking.endTime,
            attendees: [booking.guestEmail],
            timezone: booking.timezone,
          })

          googleEventId = calendarEvent.eventId || undefined
          googleMeetLink = calendarEvent.meetLink || undefined
        } catch (error) {
          console.error('Failed to create Google Calendar event:', error)
        }
      }

      // Outlook Calendar
      if (booking.eventType.user.outlookIntegration?.active) {
        try {
          const outlookEvent = await createOutlookCalendarEvent(booking.eventType.userId, {
            summary: `${booking.eventType.title} - ${booking.guestName}`,
            description: eventDescription,
            startTime: booking.startTime,
            endTime: booking.endTime,
            attendees: [booking.guestEmail],
            timezone: booking.timezone,
            includeTeamsMeeting: true,
          })

          outlookEventId = outlookEvent.eventId
          teamsMeetLink = outlookEvent.meetLink
        } catch (error) {
          console.error('Failed to create Outlook Calendar event:', error)
        }
      }

      // Update booking with calendar details
      if (googleEventId || outlookEventId) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            googleEventId,
            googleMeetLink,
            outlookEventId,
            teamsMeetLink,
          },
        })
      }

      // Send conversion tracking
      const trackingData = await prisma.trackingData.findUnique({
        where: { bookingId: booking.id },
      })

      if (trackingData?.gclid) {
        try {
          const trackingSettings = await prisma.trackingSettings.findUnique({
            where: { userId: booking.eventType.userId },
          })

          if (trackingSettings?.googleAdsEnabled && trackingSettings.trackingMode === 'CONTINUOUS') {
            sendBookingConversion(booking.id).catch((error) => {
              console.error('Failed to send conversion (non-blocking):', error)
            })
          }
        } catch (error) {
          console.error('Failed to check tracking settings:', error)
        }
      }

      // TODO: Send confirmation email
    }

    // Return booking data
    const finalBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        eventType: {
          select: {
            title: true,
            description: true,
            duration: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json({ booking: finalBooking })
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      {
        error: 'Failed to verify payment',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
