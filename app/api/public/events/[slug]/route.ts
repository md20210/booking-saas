import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/public/events/[slug]
 * Returns a public event type by slug (no authentication required)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const eventType = await prisma.eventType.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        duration: true,
        price: true,
        currency: true,
        active: true,
        user: {
          select: {
            name: true,
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
        { error: 'Event type is not available' },
        { status: 403 }
      )
    }

    // Don't expose user details, just return event type info
    const publicEventType = {
      id: eventType.id,
      title: eventType.title,
      slug: eventType.slug,
      description: eventType.description,
      duration: eventType.duration,
      price: eventType.price,
      currency: eventType.currency,
      ownerName: eventType.user.name,
      calendarConnected: eventType.user.googleIntegration?.active || false,
    }

    return NextResponse.json({ eventType: publicEventType }, { status: 200 })
  } catch (error) {
    console.error('GET /api/public/events/[slug] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
