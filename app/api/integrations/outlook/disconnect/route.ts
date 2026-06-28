/**
 * Disconnect Microsoft Outlook Integration
 *
 * Removes Outlook integration and revokes access
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Check if integration exists
    const integration = await prisma.outlookIntegration.findUnique({
      where: { userId },
      select: { id: true, accessToken: true },
    })

    if (!integration) {
      return NextResponse.json(
        { error: 'No Outlook integration found' },
        { status: 404 }
      )
    }

    // Optionally revoke the token with Microsoft
    // Note: Microsoft doesn't provide a simple revoke endpoint like Google
    // The tokens will expire naturally, or user can revoke via account.microsoft.com

    // Delete integration from database
    await prisma.outlookIntegration.delete({
      where: { userId },
    })

    console.log(`✅ Outlook integration disconnected for user ${userId}`)

    return NextResponse.json({
      success: true,
      message: 'Outlook integration disconnected successfully',
    })
  } catch (error) {
    console.error('Outlook disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect Outlook integration' },
      { status: 500 }
    )
  }
}
