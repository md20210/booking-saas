import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createDefaultSetup, checkOnboardingStatus } from '@/lib/onboarding/default-setup'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Check if user already has event types
    const status = await checkOnboardingStatus(userId)

    if (status.hasEventTypes) {
      return NextResponse.json({
        message: 'User already has event types configured',
        status,
      })
    }

    // Create default setup
    const result = await createDefaultSetup(userId)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error('Error in onboarding setup:', error)
    return NextResponse.json(
      { error: 'Failed to create default setup' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const status = await checkOnboardingStatus(userId)

    return NextResponse.json(status)
  } catch (error) {
    console.error('Error fetching onboarding status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch onboarding status' },
      { status: 500 }
    )
  }
}
