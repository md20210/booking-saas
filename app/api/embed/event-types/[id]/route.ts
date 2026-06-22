import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/embed/event-types/[id]
 * Returns event type data for embed widget (requires API key authentication)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get API key from Authorization header
    const authHeader = request.headers.get('Authorization')
    const apiKey = authHeader?.replace('Bearer ', '')

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required' },
        { status: 401 }
      )
    }

    // Validate API key
    const validApiKey = await prisma.apiKey.findUnique({
      where: {
        key: apiKey,
        active: true,
      },
      include: {
        user: true,
      },
    })

    if (!validApiKey) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }

    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: validApiKey.id },
      data: { lastUsedAt: new Date() },
    })

    // Fetch event type
    const eventType = await prisma.eventType.findUnique({
      where: {
        id,
        userId: validApiKey.userId, // Ensure event belongs to API key owner
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        duration: true,
        price: true,
        currency: true,
        active: true,
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

    return NextResponse.json({ eventType }, { status: 200 })
  } catch (error) {
    console.error('GET /api/embed/event-types/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
