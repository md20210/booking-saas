/**
 * Microsoft Outlook OAuth2 Authorization Initiation
 *
 * Redirects user to Microsoft login to grant calendar access
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const clientId = process.env.MICROSOFT_CLIENT_ID
    const redirectUri = process.env.MICROSOFT_REDIRECT_URI
    const tenantId = process.env.MICROSOFT_TENANT_ID || 'common'

    if (!clientId || !redirectUri) {
      console.error('Missing Microsoft OAuth configuration')
      return NextResponse.json(
        { error: 'Microsoft OAuth not configured' },
        { status: 500 }
      )
    }

    // Microsoft Graph API Scopes
    const scopes = [
      'openid',
      'profile',
      'email',
      'offline_access',
      'Calendars.ReadWrite',
      'OnlineMeetings.ReadWrite', // For Teams meetings
    ]

    // Build authorization URL
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      response_mode: 'query',
      scope: scopes.join(' '),
      state: session.user.id, // Pass user ID to identify on callback
    })

    const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params.toString()}`

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Outlook auth error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Outlook authorization' },
      { status: 500 }
    )
  }
}
