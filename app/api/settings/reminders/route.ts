import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { reminderSettings: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return existing settings or defaults
    const settings = user.reminderSettings || {
      email1HourBefore: true,
      email24HoursBefore: true,
      email1WeekBefore: false,
      sms1HourBefore: false,
      sms24HoursBefore: false,
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching reminder settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      email1HourBefore,
      email24HoursBefore,
      email1WeekBefore,
      sms1HourBefore,
      sms24HoursBefore,
    } = body

    // Upsert reminder settings
    const settings = await prisma.reminderSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        email1HourBefore: email1HourBefore ?? true,
        email24HoursBefore: email24HoursBefore ?? true,
        email1WeekBefore: email1WeekBefore ?? false,
        sms1HourBefore: sms1HourBefore ?? false,
        sms24HoursBefore: sms24HoursBefore ?? false,
      },
      update: {
        email1HourBefore,
        email24HoursBefore,
        email1WeekBefore,
        sms1HourBefore,
        sms24HoursBefore,
      },
    })

    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error('Error saving reminder settings:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
