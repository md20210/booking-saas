import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Validation schema for updating event types
const updateEventTypeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long').optional(),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(50, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  description: z.string().optional().nullable(),
  duration: z.number().int().min(5, 'Duration must be at least 5 minutes').max(1440, 'Duration cannot exceed 24 hours').optional(),
  bufferTime: z.number().int().min(0).max(120).optional(),
  availabilityType: z.enum(['inherit', 'custom']).optional(),
  availability: z.any().optional().nullable(), // JSON field
  price: z.number().positive().optional().nullable(),
  currency: z.string().length(3).optional(),
  customFields: z.any().optional().nullable(), // JSON field
  requiresConfirmation: z.boolean().optional(),
  redirectUrl: z.string().url().optional().nullable().or(z.literal('')),
  active: z.boolean().optional(),
})

/**
 * GET /api/events/[id]
 * Returns a single event type by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const eventType = await prisma.eventType.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
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

    if (!eventType) {
      return NextResponse.json({ error: 'Event type not found' }, { status: 404 })
    }

    // Check ownership
    if (eventType.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ eventType }, { status: 200 })
  } catch (error) {
    console.error('GET /api/events/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/events/[id]
 * Updates an existing event type
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if event type exists and belongs to user
    const existingEventType = await prisma.eventType.findUnique({
      where: { id },
      select: { userId: true, slug: true },
    })

    if (!existingEventType) {
      return NextResponse.json({ error: 'Event type not found' }, { status: 404 })
    }

    // Check ownership
    if (existingEventType.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    // Validate request body
    const validationResult = updateEventTypeSchema.safeParse(body)

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

    // If slug is being updated, check if new slug already exists
    if (data.slug && data.slug !== existingEventType.slug) {
      const slugExists = await prisma.eventType.findUnique({
        where: { slug: data.slug },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'Slug already exists. Please choose a different slug.' },
          { status: 409 }
        )
      }
    }

    // Update event type
    const eventType = await prisma.eventType.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.bufferTime !== undefined && { bufferTime: data.bufferTime }),
        ...(data.availabilityType !== undefined && { availabilityType: data.availabilityType }),
        ...(data.availability !== undefined && { availability: data.availability }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.customFields !== undefined && { customFields: data.customFields }),
        ...(data.requiresConfirmation !== undefined && { requiresConfirmation: data.requiresConfirmation }),
        ...(data.redirectUrl !== undefined && { redirectUrl: data.redirectUrl }),
        ...(data.active !== undefined && { active: data.active }),
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

    return NextResponse.json({ eventType }, { status: 200 })
  } catch (error) {
    console.error('PUT /api/events/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/events/[id]
 * Deletes an event type
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if event type exists and belongs to user
    const existingEventType = await prisma.eventType.findUnique({
      where: { id },
      select: {
        userId: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    })

    if (!existingEventType) {
      return NextResponse.json({ error: 'Event type not found' }, { status: 404 })
    }

    // Check ownership
    if (existingEventType.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Optional: Check if there are active bookings
    // You can uncomment this to prevent deletion of event types with bookings
    /*
    if (existingEventType._count.bookings > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete event type with existing bookings',
          bookingsCount: existingEventType._count.bookings
        },
        { status: 409 }
      )
    }
    */

    // Delete event type (cascades to bookings via Prisma schema)
    await prisma.eventType.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'Event type deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('DELETE /api/events/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
