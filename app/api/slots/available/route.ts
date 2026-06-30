import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAvailableSlots } from '@/lib/google-calendar'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') // YYYY-MM-DD
    const duration = parseInt(searchParams.get('duration') || '30')
    const timeRange = searchParams.get('timeRange') || '9-17'
    const bufferTime = parseInt(searchParams.get('bufferTime') || '0')

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required (format: YYYY-MM-DD)' },
        { status: 400 }
      )
    }

    // Get user's Google account
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'google',
      },
    })

    if (!account || !account.access_token || !account.refresh_token) {
      return NextResponse.json(
        { error: 'Google Calendar not connected. Please reconnect your Google account.' },
        { status: 403 }
      )
    }

    // Fetch available slots
    const slots = await getAvailableSlots(
      account.access_token,
      account.refresh_token,
      date,
      duration,
      timeRange,
      bufferTime,
      process.env.GOOGLE_CALENDAR_ID || 'primary'
    )

    return NextResponse.json({
      success: true,
      date,
      slots: slots.map(slot => ({
        start: slot.start.toISOString(),
        end: slot.end.toISOString(),
        available: slot.available,
      })),
      count: slots.length,
    })
  } catch (error: any) {
    console.error('Error fetching available slots:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available slots', details: error.message },
      { status: 500 }
    )
  }
}
