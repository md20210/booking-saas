import Stripe from 'stripe'

function getStripe(): Stripe {
  const apiKey = process.env.STRIPE_SECRET_KEY

  if (!apiKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }

  return new Stripe(apiKey, {
    apiVersion: '2026-06-24.dahlia',
    typescript: true,
  })
}

export async function createCheckoutSession({
  priceAmount,
  currency,
  customerEmail,
  bookingId,
  successUrl,
  cancelUrl,
}: {
  priceAmount: number
  currency: string
  customerEmail: string
  bookingId: string
  successUrl: string
  cancelUrl: string
}) {
  const stripeClient = getStripe()
  const session = await stripeClient.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: 'Booking Payment',
            description: `Payment for booking ${bookingId}`,
          },
          unit_amount: Math.round(priceAmount * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    customer_email: customerEmail,
    metadata: {
      bookingId,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  })

  return session
}

export async function getPaymentIntent(paymentIntentId: string) {
  const stripeClient = getStripe()
  return await stripeClient.paymentIntents.retrieve(paymentIntentId)
}

export async function refundPayment(paymentIntentId: string) {
  const stripeClient = getStripe()
  return await stripeClient.refunds.create({
    payment_intent: paymentIntentId,
  })
}
