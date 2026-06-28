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

    const userId = session.user.id

    const settings = await prisma.trackingSettings.findUnique({
      where: { userId },
      select: {
        microsoftClarityId: true,
      },
    })

    if (!settings) {
      return NextResponse.json({
        microsoftClarityId: null,
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching analytics settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()

    const { microsoftClarityId } = body

    // Upsert tracking settings
    const settings = await prisma.trackingSettings.upsert({
      where: { userId },
      create: {
        userId,
        microsoftClarityId,
      },
      update: {
        microsoftClarityId,
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error saving analytics settings:', error)
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    )
  }
}
