import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/db'
import { createCalendarEvent } from '@/lib/google/calendar'
import { createOutlookCalendarEvent } from '@/lib/calendar/outlook'
import { sendBookingConversion } from '@/lib/conversion-tracking/google-ads'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const stripeApiKey = process.env.STRIPE_SECRET_KEY

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  if (!stripeApiKey) {
    console.error('STRIPE_SECRET_KEY is not configured')
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const stripe = new Stripe(stripeApiKey, {
    apiVersion: '2026-06-24.dahlia',
    typescript: true,
  })

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}` },
      { status: 400 }
    )
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (!session.metadata?.bookingId) {
          console.error('No bookingId in session metadata')
          break
        }

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
          console.error(`Booking not found: ${session.metadata.bookingId}`)
          break
        }

        // Only process if not already processed
        if (booking.paymentStatus === 'SUCCEEDED') {
          console.log(`Booking ${booking.id} already processed`)
          break
        }

        // Update booking
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            status: 'CONFIRMED',
            paymentStatus: 'SUCCEEDED',
            stripePaymentIntentId: session.payment_intent as string,
            paidAt: new Date(),
          },
        })

        console.log(`✅ Payment succeeded for booking ${booking.id}`)

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

            console.log(`✅ Created Google Calendar event for booking ${booking.id}`)
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

            console.log(`✅ Created Outlook Calendar event for booking ${booking.id}`)
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

            if (
              trackingSettings?.googleAdsEnabled &&
              trackingSettings.trackingMode === 'CONTINUOUS'
            ) {
              await sendBookingConversion(booking.id)
              console.log(`✅ Sent Google Ads conversion for booking ${booking.id}`)
            }
          } catch (error) {
            console.error('Failed to send conversion tracking:', error)
          }
        }

        // TODO: Send confirmation email

        // Trigger webhook events
        const webhooks = await prisma.webhook.findMany({
          where: {
            userId: booking.eventType.userId,
            active: true,
            events: {
              has: 'PAYMENT_SUCCEEDED',
            },
          },
        })

        for (const webhook of webhooks) {
          try {
            const payload = {
              event: 'PAYMENT_SUCCEEDED',
              booking: {
                id: booking.id,
                eventType: booking.eventType.title,
                attendeeName: booking.guestName,
                attendeeEmail: booking.guestEmail,
                startTime: booking.startTime.toISOString(),
                endTime: booking.endTime.toISOString(),
                paymentAmount: booking.paymentAmount,
                paymentCurrency: booking.paymentCurrency,
              },
              timestamp: new Date().toISOString(),
            }

            const headers: Record<string, string> = {
              'Content-Type': 'application/json',
              'User-Agent': 'BookingSaaS-Webhook/1.0',
            }

            if (webhook.secret) {
              headers['X-Webhook-Secret'] = webhook.secret
            }

            await fetch(webhook.url, {
              method: 'POST',
              headers,
              body: JSON.stringify(payload),
            })

            await prisma.webhook.update({
              where: { id: webhook.id },
              data: {
                lastTriggeredAt: new Date(),
              },
            })
          } catch (error) {
            console.error(`Failed to trigger webhook ${webhook.id}:`, error)
            await prisma.webhook.update({
              where: { id: webhook.id },
              data: {
                failureCount: {
                  increment: 1,
                },
              },
            })
          }
        }

        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.metadata?.bookingId) {
          await prisma.booking.update({
            where: { id: session.metadata.bookingId },
            data: {
              status: 'CANCELLED',
              paymentStatus: 'CANCELLED',
            },
          })

          console.log(`❌ Checkout session expired for booking ${session.metadata.bookingId}`)
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Find booking by payment intent ID
        const booking = await prisma.booking.findFirst({
          where: { stripePaymentIntentId: paymentIntent.id },
        })

        if (booking) {
          await prisma.booking.update({
            where: { id: booking.id },
            data: {
              paymentStatus: 'FAILED',
            },
          })

          console.log(`❌ Payment failed for booking ${booking.id}`)

          // Trigger webhook events
          const webhooks = await prisma.webhook.findMany({
            where: {
              userId: booking.userId,
              active: true,
              events: {
                has: 'PAYMENT_FAILED',
              },
            },
          })

          for (const webhook of webhooks) {
            try {
              const payload = {
                event: 'PAYMENT_FAILED',
                booking: {
                  id: booking.id,
                  attendeeEmail: booking.guestEmail,
                  error: paymentIntent.last_payment_error?.message,
                },
                timestamp: new Date().toISOString(),
              }

              const headers: Record<string, string> = {
                'Content-Type': 'application/json',
              }

              if (webhook.secret) {
                headers['X-Webhook-Secret'] = webhook.secret
              }

              await fetch(webhook.url, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
              })

              await prisma.webhook.update({
                where: { id: webhook.id },
                data: { lastTriggeredAt: new Date() },
              })
            } catch (error) {
              console.error(`Failed to trigger webhook ${webhook.id}:`, error)
            }
          }
        }

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
