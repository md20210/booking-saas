import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await prisma.paymentSettings.findUnique({
      where: { userId: session.user.id },
    })

    // Don't send secret key to client
    if (settings) {
      const { stripeSecretKey, ...safeSettings } = settings
      return NextResponse.json(safeSettings)
    }

    return NextResponse.json(null)
  } catch (error) {
    console.error('Error fetching payment settings:', error)
    return NextResponse.json({ error: 'Failed to fetch payment settings' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { stripePublishableKey, stripeSecretKey, stripeEnabled, defaultCurrency } = body

    const settings = await prisma.paymentSettings.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        stripePublishableKey,
        stripeSecretKey,
        stripeEnabled: stripeEnabled || false,
        defaultCurrency: defaultCurrency || 'EUR',
      },
      update: {
        ...(stripePublishableKey !== undefined && { stripePublishableKey }),
        ...(stripeSecretKey !== undefined && { stripeSecretKey }),
        ...(stripeEnabled !== undefined && { stripeEnabled }),
        ...(defaultCurrency !== undefined && { defaultCurrency }),
      },
    })

    // Don't send secret key to client
    const { stripeSecretKey: _, ...safeSettings } = settings

    return NextResponse.json(safeSettings)
  } catch (error) {
    console.error('Error updating payment settings:', error)
    return NextResponse.json({ error: 'Failed to update payment settings' }, { status: 500 })
  }
}
