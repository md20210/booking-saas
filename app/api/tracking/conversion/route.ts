import { NextRequest, NextResponse } from 'next/server'
import { sendBookingConversion, batchSendConversions } from '@/lib/conversion-tracking/google-ads'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import * as Sentry from '@sentry/nextjs'

/**
 * POST /api/tracking/conversion
 *
 * Manually trigger conversion sending for a booking
 * This can be called after a booking is confirmed
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { bookingId } = body

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Send conversion
    await sendBookingConversion(bookingId)

    return NextResponse.json({
      success: true,
      message: 'Conversion sent successfully'
    })
  } catch (error) {
    console.error('Conversion tracking error:', error)

    Sentry.captureException(error, {
      tags: { endpoint: 'conversion-tracking' },
      extra: { error: error instanceof Error ? error.message : 'Unknown error' }
    })

    return NextResponse.json(
      {
        error: 'Failed to send conversion',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tracking/conversion/batch
 *
 * Batch send all pending conversions for a user
 * Used for BATCH tracking mode (daily sync)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await batchSendConversions(session.user.id)

    return NextResponse.json({
      success: true,
      message: 'Batch conversions sent successfully'
    })
  } catch (error) {
    console.error('Batch conversion error:', error)

    Sentry.captureException(error, {
      tags: { endpoint: 'batch-conversion' }
    })

    return NextResponse.json(
      {
        error: 'Failed to send batch conversions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
