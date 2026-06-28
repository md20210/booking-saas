/**
 * Microsoft Outlook / Office 365 Calendar Integration
 *
 * Uses Microsoft Graph API for calendar operations
 * Documentation: https://learn.microsoft.com/en-us/graph/api/resources/calendar
 */

import { prisma } from '@/lib/db'

const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0'

interface OutlookCalendarEvent {
  subject: string
  body?: {
    contentType: 'HTML' | 'Text'
    content: string
  }
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  attendees?: Array<{
    emailAddress: {
      address: string
      name?: string
    }
    type: 'required' | 'optional'
  }>
  location?: {
    displayName: string
  }
  isOnlineMeeting?: boolean
  onlineMeetingProvider?: 'teamsForBusiness' | 'skypeForBusiness' | 'skypeForConsumer'
}

interface CreateEventParams {
  summary: string
  description?: string
  startTime: Date
  endTime: Date
  attendees?: string[]
  timezone?: string
  location?: string
  includeTeamsMeeting?: boolean
}

/**
 * Refresh Access Token using Refresh Token
 */
async function refreshAccessToken(integration: {
  id: string
  refreshToken: string
  userId: string
}): Promise<string> {
  const clientId = process.env.MICROSOFT_CLIENT_ID
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET
  const tenantId = process.env.MICROSOFT_TENANT_ID || 'common'

  if (!clientId || !clientSecret) {
    throw new Error('Microsoft OAuth credentials not configured')
  }

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
    refresh_token: integration.refreshToken,
    scope: 'https://graph.microsoft.com/.default offline_access'
  })

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Failed to refresh Outlook token:', error)
    throw new Error('Failed to refresh Outlook access token')
  }

  const data = await response.json()

  // Update integration with new tokens
  await prisma.outlookIntegration.update({
    where: { id: integration.id },
    data: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || integration.refreshToken,
      expiresAt: new Date(Date.now() + data.expires_in * 1000)
    }
  })

  return data.access_token
}

/**
 * Get valid access token (refreshes if expired)
 */
async function getValidAccessToken(userId: string): Promise<string> {
  const integration = await prisma.outlookIntegration.findUnique({
    where: { userId },
    select: {
      id: true,
      accessToken: true,
      refreshToken: true,
      expiresAt: true,
      userId: true
    }
  })

  if (!integration) {
    throw new Error('Outlook integration not found')
  }

  // Check if token is expired (with 5 minute buffer)
  const now = new Date()
  const expiryBuffer = new Date(integration.expiresAt.getTime() - 5 * 60 * 1000)

  if (now >= expiryBuffer) {
    console.log('Outlook token expired, refreshing...')
    return await refreshAccessToken(integration)
  }

  return integration.accessToken
}

/**
 * Create Calendar Event in Outlook
 */
export async function createOutlookCalendarEvent(
  userId: string,
  params: CreateEventParams
): Promise<{ eventId: string; meetLink?: string }> {
  try {
    const accessToken = await getValidAccessToken(userId)

    const integration = await prisma.outlookIntegration.findUnique({
      where: { userId },
      select: { calendarId: true }
    })

    if (!integration) {
      throw new Error('Outlook integration not found')
    }

    // Build event object
    const event: OutlookCalendarEvent = {
      subject: params.summary,
      body: params.description ? {
        contentType: 'HTML',
        content: params.description.replace(/\n/g, '<br>')
      } : undefined,
      start: {
        dateTime: params.startTime.toISOString(),
        timeZone: params.timezone || 'UTC'
      },
      end: {
        dateTime: params.endTime.toISOString(),
        timeZone: params.timezone || 'UTC'
      },
      attendees: params.attendees?.map(email => ({
        emailAddress: {
          address: email
        },
        type: 'required' as const
      })),
      location: params.location ? {
        displayName: params.location
      } : undefined,
      isOnlineMeeting: params.includeTeamsMeeting ?? true,
      onlineMeetingProvider: params.includeTeamsMeeting ? 'teamsForBusiness' : undefined
    }

    // Create event via Microsoft Graph API
    const calendarPath = integration.calendarId === 'primary'
      ? '/me/calendar/events'
      : `/me/calendars/${integration.calendarId}/events`

    const response = await fetch(`${GRAPH_API_BASE}${calendarPath}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Failed to create Outlook event:', error)
      throw new Error(`Failed to create Outlook calendar event: ${error}`)
    }

    const createdEvent = await response.json()

    return {
      eventId: createdEvent.id,
      meetLink: createdEvent.onlineMeeting?.joinUrl
    }
  } catch (error) {
    console.error('Error creating Outlook calendar event:', error)
    throw error
  }
}

/**
 * Get User's Calendars
 */
export async function getOutlookCalendars(userId: string) {
  try {
    const accessToken = await getValidAccessToken(userId)

    const response = await fetch(`${GRAPH_API_BASE}/me/calendars`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch calendars')
    }

    const data = await response.json()
    return data.value
  } catch (error) {
    console.error('Error fetching Outlook calendars:', error)
    throw error
  }
}

/**
 * Update Calendar Event
 */
export async function updateOutlookCalendarEvent(
  userId: string,
  eventId: string,
  params: Partial<CreateEventParams>
): Promise<void> {
  try {
    const accessToken = await getValidAccessToken(userId)

    const updates: Partial<OutlookCalendarEvent> = {}

    if (params.summary) updates.subject = params.summary
    if (params.description) {
      updates.body = {
        contentType: 'HTML',
        content: params.description.replace(/\n/g, '<br>')
      }
    }
    if (params.startTime && params.timezone) {
      updates.start = {
        dateTime: params.startTime.toISOString(),
        timeZone: params.timezone
      }
    }
    if (params.endTime && params.timezone) {
      updates.end = {
        dateTime: params.endTime.toISOString(),
        timeZone: params.timezone
      }
    }

    const response = await fetch(`${GRAPH_API_BASE}/me/events/${eventId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    })

    if (!response.ok) {
      throw new Error('Failed to update Outlook event')
    }
  } catch (error) {
    console.error('Error updating Outlook event:', error)
    throw error
  }
}

/**
 * Delete Calendar Event
 */
export async function deleteOutlookCalendarEvent(
  userId: string,
  eventId: string
): Promise<void> {
  try {
    const accessToken = await getValidAccessToken(userId)

    const response = await fetch(`${GRAPH_API_BASE}/me/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok && response.status !== 404) {
      throw new Error('Failed to delete Outlook event')
    }
  } catch (error) {
    console.error('Error deleting Outlook event:', error)
    throw error
  }
}

/**
 * Check if user has active Outlook integration
 */
export async function hasOutlookIntegration(userId: string): Promise<boolean> {
  const integration = await prisma.outlookIntegration.findUnique({
    where: { userId },
    select: { active: true }
  })

  return integration?.active ?? false
}
