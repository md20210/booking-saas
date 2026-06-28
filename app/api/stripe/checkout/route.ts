import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createCheckoutSession } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      eventTypeId,
      startTime,
      endTime,
      attendeeName,
      attendeeEmail,
      attendeePhone,
      timezone,
      utmParams,
      gclid,
      gbraid,
      wbraid,
    } = body

    // Fetch event type with payment settings
    const eventType = await prisma.eventType.findUnique({
      where: { id: eventTypeId },
      include: {
        user: {
          include: {
            paymentSettings: true,
          },
        },
      },
    })

    if (!eventType) {
      return NextResponse.json({ error: 'Event type not found' }, { status: 404 })
    }

    // Check if payment is required
    if (!eventType.price || Number(eventType.price) <= 0) {
      return NextResponse.json(
        { error: 'This event does not require payment' },
        { status: 400 }
      )
    }

    // Check if Stripe is configured and enabled
    const paymentSettings = eventType.user.paymentSettings
    if (!paymentSettings || !paymentSettings.stripeEnabled) {
      return NextResponse.json(
        { error: 'Payment processing is not available for this event' },
        { status: 424 }
      )
    }

    if (!paymentSettings.stripeSecretKey) {
      return NextResponse.json(
        { error: 'Payment configuration incomplete' },
        { status: 500 }
      )
    }

    // Create pending booking first
    const booking = await prisma.booking.create({
      data: {
        userId: eventType.userId,
        eventTypeId,
        guestName: attendeeName,
        guestEmail: attendeeEmail,
        guestPhone: attendeePhone,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        timezone: timezone || 'UTC',
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentAmount: eventType.price,
        paymentCurrency: eventType.currency || paymentSettings.defaultCurrency,
      },
    })

    // Create tracking data if present
    if (utmParams || gclid || gbraid || wbraid) {
      await prisma.trackingData.create({
        data: {
          bookingId: booking.id,
          gclid,
          gbraid,
          wbraid,
          utmSource: utmParams?.utm_source,
          utmMedium: utmParams?.utm_medium,
          utmCampaign: utmParams?.utm_campaign,
          utmTerm: utmParams?.utm_term,
          utmContent: utmParams?.utm_content,
          conversionSent: false,
        },
      }).catch((err) => {
        console.error('Failed to create tracking data:', err)
      })
    }

    // Create Stripe checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || 'http://localhost:3000'

    const session = await createCheckoutSession({
      priceAmount: Number(eventType.price),
      currency: eventType.currency || paymentSettings.defaultCurrency,
      customerEmail: attendeeEmail,
      bookingId: booking.id,
      successUrl: `${baseUrl}/book/${eventType.slug}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/book/${eventType.slug}?cancelled=true`,
    })

    // Store checkout session ID
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        stripeCheckoutSessionId: session.id,
        paymentStatus: 'PROCESSING',
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      {
        error: 'Failed to create payment session',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
