import { prisma } from './db'

export type VideoProvider = 'google_meet' | 'teams' | 'zoom' | 'custom'

/**
 * Generate video conference link based on provider
 */
export async function generateVideoLink(
  bookingId: string,
  provider: VideoProvider,
  userId: string
): Promise<string | null> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      eventType: true,
    },
  })

  if (!booking) return null

  switch (provider) {
    case 'google_meet':
      // Google Meet link is auto-generated when creating calendar event
      return booking.googleMeetLink || null

    case 'teams':
      // Teams link is auto-generated when creating Outlook calendar event
      return booking.teamsMeetLink || null

    case 'zoom':
      // Zoom integration would require Zoom API
      return await generateZoomLink(booking, userId)

    case 'custom':
      // Custom video link (user-provided URL)
      return booking.eventType.customVideoUrl || null

    default:
      return null
  }
}

/**
 * Generate Zoom meeting link
 * Note: Requires Zoom OAuth integration
 */
async function generateZoomLink(booking: any, userId: string): Promise<string | null> {
  // Check if user has Zoom integration
  const zoomIntegration = await prisma.zoomIntegration.findUnique({
    where: { userId },
  }).catch(() => null)

  if (!zoomIntegration || !zoomIntegration.active) {
    return null
  }

  try {
    // In production, this would call Zoom API to create meeting
    // For now, return placeholder
    // TODO: Implement actual Zoom API call

    const meetingUrl = `https://zoom.us/j/placeholder-${booking.id}`

    // Store Zoom link in booking
    await prisma.booking.update({
      where: { id: booking.id },
      data: { zoomMeetLink: meetingUrl },
    })

    return meetingUrl
  } catch (error) {
    console.error('Failed to generate Zoom link:', error)
    return null
  }
}

/**
 * Get preferred video provider for an event type
 */
export async function getPreferredVideoProvider(eventTypeId: string): Promise<VideoProvider> {
  const eventType = await prisma.eventType.findUnique({
    where: { id: eventTypeId },
    select: { videoProvider: true },
  })

  return (eventType?.videoProvider as VideoProvider) || 'google_meet'
}
