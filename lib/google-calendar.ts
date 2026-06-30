import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'

// Initialize OAuth2 client
export function getOAuth2Client() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL + '/api/auth/callback/google'
  )

  return oauth2Client
}

// Get Calendar client with user credentials
export function getCalendarClient(accessToken: string, refreshToken: string) {
  const oauth2Client = getOAuth2Client()

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  return google.calendar({ version: 'v3', auth: oauth2Client })
}

// Get available time slots for a given date
export async function getAvailableSlots(
  accessToken: string,
  refreshToken: string,
  date: string, // YYYY-MM-DD
  duration: number, // minutes
  timeRange: string, // e.g., "9-17"
  bufferTime: number = 0, // minutes
  calendarId: string = 'primary'
) {
  const calendar = getCalendarClient(accessToken, refreshToken)

  const [startHour, endHour] = timeRange.split('-').map(Number)

  const timeMin = new Date(`${date}T${startHour.toString().padStart(2, '0')}:00:00`)
  const timeMax = new Date(`${date}T${endHour.toString().padStart(2, '0')}:00:00`)

  try {
    // Get existing events for the day
    const response = await calendar.events.list({
      calendarId,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    })

    const existingEvents = response.data.items || []

    // Generate all possible slots
    const slots: Array<{ start: Date; end: Date; available: boolean }> = []
    let currentTime = new Date(timeMin)

    while (currentTime < timeMax) {
      const slotEnd = new Date(currentTime.getTime() + duration * 60000)

      if (slotEnd <= timeMax) {
        // Check if slot conflicts with existing events
        const isAvailable = !existingEvents.some(event => {
          const eventStart = new Date(event.start?.dateTime || event.start?.date || '')
          const eventEnd = new Date(event.end?.dateTime || event.end?.date || '')

          // Check for overlap
          return (
            (currentTime >= eventStart && currentTime < eventEnd) ||
            (slotEnd > eventStart && slotEnd <= eventEnd) ||
            (currentTime <= eventStart && slotEnd >= eventEnd)
          )
        })

        slots.push({
          start: new Date(currentTime),
          end: new Date(slotEnd),
          available: isAvailable,
        })
      }

      // Move to next slot (duration + buffer)
      currentTime = new Date(currentTime.getTime() + (duration + bufferTime) * 60000)
    }

    return slots.filter(slot => slot.available)
  } catch (error: any) {
    console.error('Error fetching calendar slots:', error)
    throw new Error(`Failed to fetch available slots: ${error.message}`)
  }
}

// Create a new calendar event (booking)
export async function createCalendarEvent(
  accessToken: string,
  refreshToken: string,
  eventData: {
    summary: string
    description: string
    start: Date
    end: Date
    attendees: string[]
    location?: string
    calendarId?: string
  }
) {
  const calendar = getCalendarClient(accessToken, refreshToken)

  try {
    const response = await calendar.events.insert({
      calendarId: eventData.calendarId || 'primary',
      conferenceDataVersion: 1, // Enable Google Meet link
      requestBody: {
        summary: eventData.summary,
        description: eventData.description,
        start: {
          dateTime: eventData.start.toISOString(),
          timeZone: 'Europe/Berlin',
        },
        end: {
          dateTime: eventData.end.toISOString(),
          timeZone: 'Europe/Berlin',
        },
        attendees: eventData.attendees.map(email => ({ email })),
        conferenceData: {
          createRequest: {
            requestId: `booking-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
        location: eventData.location,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 }, // 30 min before
          ],
        },
      },
    })

    return {
      success: true,
      eventId: response.data.id,
      eventLink: response.data.htmlLink,
      meetLink: response.data.hangoutLink,
      conferenceData: response.data.conferenceData,
    }
  } catch (error: any) {
    console.error('Error creating calendar event:', error)
    throw new Error(`Failed to create calendar event: ${error.message}`)
  }
}

// Cancel a calendar event
export async function cancelCalendarEvent(
  accessToken: string,
  refreshToken: string,
  eventId: string,
  calendarId: string = 'primary'
) {
  const calendar = getCalendarClient(accessToken, refreshToken)

  try {
    await calendar.events.delete({
      calendarId,
      eventId,
      sendUpdates: 'all', // Notify all attendees
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error canceling calendar event:', error)
    throw new Error(`Failed to cancel calendar event: ${error.message}`)
  }
}
