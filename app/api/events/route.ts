import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Validation schema for creating event types
const createEventTypeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(50, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  duration: z.number().int().min(5, 'Duration must be at least 5 minutes').max(1440, 'Duration cannot exceed 24 hours'),
  bufferTime: z.number().int().min(0).max(120).default(0),
  availabilityType: z.enum(['inherit', 'custom']).default('inherit'),
  availability: z.any().optional(), // JSON field
  price: z.number().positive().optional(),
  currency: z.string().length(3).default('EUR'),
  customFields: z.any().optional(), // JSON field
  requiresConfirmation: z.boolean().default(false),
  redirectUrl: z.string().url().optional().or(z.literal('')),
  active: z.boolean().default(true),
})

/**
 * GET /api/events
 * Returns all event types for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const eventTypes = await prisma.eventType.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        duration: true,
        bufferTime: true,
        availabilityType: true,
        availability: true,
        price: true,
        currency: true,
        customFields: true,
        requiresConfirmation: true,
        redirectUrl: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    })

    return NextResponse.json({ eventTypes }, { status: 200 })
  } catch (error) {
    console.error('GET /api/events error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/events
 * Creates a new event type for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate request body
    const validationResult = createEventTypeSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Check if slug already exists
    const existingEventType = await prisma.eventType.findUnique({
      where: { slug: data.slug },
    })

    if (existingEventType) {
      return NextResponse.json(
        { error: 'Slug already exists. Please choose a different slug.' },
        { status: 409 }
      )
    }

    // Create event type
    const eventType = await prisma.eventType.create({
      data: {
        userId: session.user.id,
        title: data.title,
        slug: data.slug,
        description: data.description,
        duration: data.duration,
        bufferTime: data.bufferTime,
        availabilityType: data.availabilityType,
        availability: data.availability,
        price: data.price,
        currency: data.currency,
        customFields: data.customFields,
        requiresConfirmation: data.requiresConfirmation,
        redirectUrl: data.redirectUrl,
        active: data.active,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        duration: true,
        bufferTime: true,
        availabilityType: true,
        availability: true,
        price: true,
        currency: true,
        customFields: true,
        requiresConfirmation: true,
        redirectUrl: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ eventType }, { status: 201 })
  } catch (error) {
    console.error('POST /api/events error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
