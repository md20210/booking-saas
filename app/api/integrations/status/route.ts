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

    const [googleIntegration, outlookIntegration] = await Promise.all([
      prisma.googleIntegration.findUnique({
        where: { userId },
        select: { active: true },
      }),
      prisma.outlookIntegration.findUnique({
        where: { userId },
        select: { active: true },
      }),
    ])

    return NextResponse.json({
      google: googleIntegration,
      outlook: outlookIntegration,
    })
  } catch (error) {
    console.error('Error fetching integration status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch integration status' },
      { status: 500 }
    )
  }
}
