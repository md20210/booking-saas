/**
 * Microsoft Outlook OAuth2 Callback Handler
 *
 * Exchanges authorization code for access token and refresh token
 * Stores tokens in database
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state') // userId
    const error = searchParams.get('error')

    // Handle user denial
    if (error) {
      console.error('Outlook OAuth error:', error)
      return NextResponse.redirect(
        new URL(
          '/integrations?error=outlook_denied',
          request.url
        )
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL(
          '/integrations?error=invalid_callback',
          request.url
        )
      )
    }

    const userId = state
    const clientId = process.env.MICROSOFT_CLIENT_ID
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET
    const redirectUri = process.env.MICROSOFT_REDIRECT_URI
    const tenantId = process.env.MICROSOFT_TENANT_ID || 'common'

    if (!clientId || !clientSecret || !redirectUri) {
      console.error('Missing Microsoft OAuth configuration')
      return NextResponse.redirect(
        new URL(
          '/integrations?error=misconfigured',
          request.url
        )
      )
    }

    // Exchange code for tokens
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      scope: 'https://graph.microsoft.com/.default offline_access',
    })

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Token exchange failed:', errorData)
      return NextResponse.redirect(
        new URL(
          '/integrations?error=token_exchange_failed',
          request.url
        )
      )
    }

    const tokenData = await tokenResponse.json()

    // Fetch user profile info
    let userEmail: string | undefined
    let displayName: string | undefined

    try {
      const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      })

      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        userEmail = profileData.mail || profileData.userPrincipalName
        displayName = profileData.displayName
      }
    } catch (profileError) {
      console.error('Failed to fetch user profile:', profileError)
      // Non-blocking, continue without profile info
    }

    // Store integration in database
    await prisma.outlookIntegration.upsert({
      where: { userId },
      create: {
        userId,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        scope: tokenData.scope,
        calendarId: 'primary',
        email: userEmail,
        displayName: displayName,
        active: true,
      },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        scope: tokenData.scope,
        email: userEmail,
        displayName: displayName,
        active: true,
      },
    })

    console.log(`✅ Outlook integration connected for user ${userId}`)

    // Redirect back to integrations page with success
    return NextResponse.redirect(
      new URL(
        '/integrations?success=outlook_connected',
        request.url
      )
    )
  } catch (error) {
    console.error('Outlook callback error:', error)
    return NextResponse.redirect(
      new URL(
        '/integrations?error=callback_failed',
        request.url
      )
    )
  }
}
