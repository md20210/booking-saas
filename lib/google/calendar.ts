import { google } from 'googleapis'
import { prisma } from '@/lib/db'

const calendar = google.calendar('v3')

/**
 * Get OAuth2 client with refresh token for a specific user
 */
export async function getCalendarClient(userId: string) {
  const integration = await prisma.googleIntegration.findUnique({
    where: { userId },
  })

  if (!integration || !integration.active) {
    throw new Error('Google Calendar integration not found or inactive')
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CALENDAR_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/google/calendar/callback`
  )

  oauth2Client.setCredentials({
    access_token: integration.accessToken,
    refresh_token: integration.refreshToken,
    expiry_date: integration.expiresAt.getTime(),
  })

  // Automatically refresh token if expired
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.refresh_token) {
      await prisma.googleIntegration.update({
        where: { userId },
        data: {
          accessToken: tokens.access_token || integration.accessToken,
          refreshToken: tokens.refresh_token,
          expiresAt: tokens.expiry_date
            ? new Date(tokens.expiry_date)
            : integration.expiresAt,
        },
      })
    } else if (tokens.access_token) {
      await prisma.googleIntegration.update({
        where: { userId },
        data: {
          accessToken: tokens.access_token,
          expiresAt: tokens.expiry_date
            ? new Date(tokens.expiry_date)
            : integration.expiresAt,
        },
      })
    }
  })

  return oauth2Client
}

/**
 * Get available time slots based on Google Calendar freebusy
 */
export async function getAvailableSlots(
  userId: string,
  startDate: Date,
  endDate: Date,
  duration: number, // in minutes
  bufferTime: number = 0 // in minutes
) {
  const oauth2Client = await getCalendarClient(userId)
  const integration = await prisma.googleIntegration.findUnique({
    where: { userId },
  })

  if (!integration) {
    throw new Error('Google Calendar integration not found')
  }

  try {
    // Query freebusy API
    const response = await calendar.freebusy.query({
      auth: oauth2Client,
      requestBody: {
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        items: [{ id: integration.calendarId }],
      },
    })

    const busySlots = response.data.calendars?.[integration.calendarId]?.busy || []

    // Generate available slots
    const slots: { start: Date; end: Date }[] = []
    const slotDuration = duration + bufferTime * 2 // Add buffer before and after
    const slotInterval = 30 // Generate slots every 30 minutes

    let currentTime = new Date(startDate)

    while (currentTime < endDate) {
      const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000)

      if (slotEnd > endDate) break

      // Check if slot conflicts with any busy period
      const isAvailable = !busySlots.some((busy) => {
        const busyStart = new Date(busy.start!)
        const busyEnd = new Date(busy.end!)

        return (
          (currentTime >= busyStart && currentTime < busyEnd) ||
          (slotEnd > busyStart && slotEnd <= busyEnd) ||
          (currentTime <= busyStart && slotEnd >= busyEnd)
        )
      })

      if (isAvailable) {
        // Return the actual booking time without buffer
        const actualStart = new Date(currentTime.getTime() + bufferTime * 60000)
        const actualEnd = new Date(actualStart.getTime() + duration * 60000)

        slots.push({
          start: actualStart,
          end: actualEnd,
        })
      }

      currentTime = new Date(currentTime.getTime() + slotInterval * 60000)
    }

    return slots
  } catch (error) {
    console.error('Error fetching available slots:', error)
    throw new Error('Failed to fetch available slots from Google Calendar')
  }
}

/**
 * Create a calendar event with Google Meet link
 */
export async function createCalendarEvent(
  userId: string,
  eventData: {
    summary: string
    description?: string
    startTime: Date
    endTime: Date
    attendees: string[] // Email addresses
    timezone?: string
  }
) {
  const oauth2Client = await getCalendarClient(userId)
  const integration = await prisma.googleIntegration.findUnique({
    where: { userId },
  })

  if (!integration) {
    throw new Error('Google Calendar integration not found')
  }

  try {
    const response = await calendar.events.insert({
      auth: oauth2Client,
      calendarId: integration.calendarId,
      conferenceDataVersion: 1, // Enable Google Meet
      requestBody: {
        summary: eventData.summary,
        description: eventData.description,
        start: {
          dateTime: eventData.startTime.toISOString(),
          timeZone: eventData.timezone || 'Europe/Berlin',
        },
        end: {
          dateTime: eventData.endTime.toISOString(),
          timeZone: eventData.timezone || 'Europe/Berlin',
        },
        attendees: eventData.attendees.map((email) => ({ email })),
        conferenceData: {
          createRequest: {
            requestId: `${userId}-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 }, // 30 minutes before
          ],
        },
      },
    })

    const event = response.data

    return {
      eventId: event.id,
      meetLink: event.conferenceData?.entryPoints?.find(
        (entry) => entry.entryPointType === 'video'
      )?.uri,
      htmlLink: event.htmlLink,
    }
  } catch (error) {
    console.error('Error creating calendar event:', error)
    throw new Error('Failed to create calendar event')
  }
}

/**
 * Update an existing calendar event
 */
export async function updateCalendarEvent(
  userId: string,
  eventId: string,
  updates: {
    summary?: string
    description?: string
    startTime?: Date
    endTime?: Date
    timezone?: string
  }
) {
  const oauth2Client = await getCalendarClient(userId)
  const integration = await prisma.googleIntegration.findUnique({
    where: { userId },
  })

  if (!integration) {
    throw new Error('Google Calendar integration not found')
  }

  try {
    const updateData: any = {}

    if (updates.summary) updateData.summary = updates.summary
    if (updates.description) updateData.description = updates.description
    if (updates.startTime) {
      updateData.start = {
        dateTime: updates.startTime.toISOString(),
        timeZone: updates.timezone || 'Europe/Berlin',
      }
    }
    if (updates.endTime) {
      updateData.end = {
        dateTime: updates.endTime.toISOString(),
        timeZone: updates.timezone || 'Europe/Berlin',
      }
    }

    await calendar.events.patch({
      auth: oauth2Client,
      calendarId: integration.calendarId,
      eventId,
      requestBody: updateData,
    })

    return { success: true }
  } catch (error) {
    console.error('Error updating calendar event:', error)
    throw new Error('Failed to update calendar event')
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(userId: string, eventId: string) {
  const oauth2Client = await getCalendarClient(userId)
  const integration = await prisma.googleIntegration.findUnique({
    where: { userId },
  })

  if (!integration) {
    throw new Error('Google Calendar integration not found')
  }

  try {
    await calendar.events.delete({
      auth: oauth2Client,
      calendarId: integration.calendarId,
      eventId,
    })

    return { success: true }
  } catch (error) {
    console.error('Error deleting calendar event:', error)
    throw new Error('Failed to delete calendar event')
  }
}

/**
 * Manually refresh access token
 */
export async function refreshAccessToken(userId: string) {
  const integration = await prisma.googleIntegration.findUnique({
    where: { userId },
  })

  if (!integration) {
    throw new Error('Google Calendar integration not found')
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CALENDAR_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/google/calendar/callback`
  )

  oauth2Client.setCredentials({
    refresh_token: integration.refreshToken,
  })

  try {
    const { credentials } = await oauth2Client.refreshAccessToken()

    await prisma.googleIntegration.update({
      where: { userId },
      data: {
        accessToken: credentials.access_token || integration.accessToken,
        expiresAt: credentials.expiry_date
          ? new Date(credentials.expiry_date)
          : integration.expiresAt,
      },
    })

    return {
      accessToken: credentials.access_token,
      expiresAt: credentials.expiry_date,
    }
  } catch (error) {
    console.error('Error refreshing access token:', error)
    throw new Error('Failed to refresh access token')
  }
}
