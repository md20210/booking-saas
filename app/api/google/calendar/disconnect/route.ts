import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { google } from 'googleapis'

/**
 * DELETE /api/google/calendar/disconnect
 * Disconnects Google Calendar integration for the authenticated user
 * Revokes OAuth tokens and removes integration from database
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Find the integration
    const integration = await prisma.googleIntegration.findUnique({
      where: { userId },
    })

    if (!integration) {
      return NextResponse.json(
        { error: 'No Google Calendar integration found' },
        { status: 404 }
      )
    }

    // Revoke the access token with Google
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CALENDAR_CLIENT_ID,
        process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
        `${process.env.NEXT_PUBLIC_APP_URL}/api/google/calendar/callback`
      )

      oauth2Client.setCredentials({
        access_token: integration.accessToken,
      })

      await oauth2Client.revokeCredentials()
    } catch (revokeError) {
      // Log but don't fail if revocation fails (token might already be invalid)
      console.warn('Failed to revoke Google token:', revokeError)
    }

    // Delete the integration from database
    await prisma.googleIntegration.delete({
      where: { userId },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Google Calendar integration disconnected successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('DELETE /api/google/calendar/disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect Google Calendar' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/google/calendar/disconnect
 * Returns the current connection status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const integration = await prisma.googleIntegration.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        active: true,
        calendarId: true,
        createdAt: true,
        updatedAt: true,
        expiresAt: true,
      },
    })

    return NextResponse.json(
      {
        connected: !!integration,
        integration: integration || null,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/google/calendar/disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to check connection status' },
      { status: 500 }
    )
  }
}
