import { prisma } from '@/lib/db'
import { addHours, addDays, isBefore, isAfter } from 'date-fns'

export type ReminderType = 'email' | 'sms'
export type ReminderTiming = '1hour' | '24hours' | '1week'

interface ReminderConfig {
  type: ReminderType
  timing: ReminderTiming
  enabled: boolean
}

/**
 * Schedule reminder for a booking
 */
export async function scheduleReminders(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      eventType: {
        include: {
          user: {
            include: {
              reminderSettings: true,
            },
          },
        },
      },
    },
  })

  if (!booking || !booking.eventType.user.reminderSettings) {
    return
  }

  const settings = booking.eventType.user.reminderSettings
  const reminders: ReminderConfig[] = []

  // Email reminders
  if (settings.email1HourBefore) {
    reminders.push({ type: 'email', timing: '1hour', enabled: true })
  }
  if (settings.email24HoursBefore) {
    reminders.push({ type: 'email', timing: '24hours', enabled: true })
  }
  if (settings.email1WeekBefore) {
    reminders.push({ type: 'email', timing: '1week', enabled: true })
  }

  // SMS reminders
  if (settings.sms1HourBefore && booking.guestPhone) {
    reminders.push({ type: 'sms', timing: '1hour', enabled: true })
  }
  if (settings.sms24HoursBefore && booking.guestPhone) {
    reminders.push({ type: 'sms', timing: '24hours', enabled: true })
  }

  // Create reminder records
  for (const reminder of reminders) {
    const sendAt = calculateSendTime(booking.startTime, reminder.timing)

    // Only schedule if send time is in the future
    if (isAfter(sendAt, new Date())) {
      await prisma.reminder.create({
        data: {
          bookingId: booking.id,
          type: reminder.type,
          sendAt,
          sent: false,
        },
      })
    }
  }
}

/**
 * Calculate when to send reminder based on timing
 */
function calculateSendTime(bookingTime: Date, timing: ReminderTiming): Date {
  switch (timing) {
    case '1hour':
      return addHours(bookingTime, -1)
    case '24hours':
      return addHours(bookingTime, -24)
    case '1week':
      return addDays(bookingTime, -7)
    default:
      return addHours(bookingTime, -1)
  }
}

/**
 * Process pending reminders (to be called by cron job)
 */
export async function processPendingReminders() {
  const now = new Date()

  // Get all unsent reminders that should be sent now
  const pendingReminders = await prisma.reminder.findMany({
    where: {
      sent: false,
      sendAt: {
        lte: now,
      },
    },
    include: {
      booking: {
        include: {
          eventType: {
            include: {
              user: true,
            },
          },
        },
      },
    },
    take: 100, // Process in batches
  })

  for (const reminder of pendingReminders) {
    try {
      if (reminder.type === 'email') {
        await sendEmailReminder(reminder.booking)
      } else if (reminder.type === 'sms') {
        await sendSMSReminder(reminder.booking)
      }

      // Mark as sent
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { sent: true, sentAt: new Date() },
      })
    } catch (error) {
      console.error(`Failed to send reminder ${reminder.id}:`, error)
      // Don't mark as sent if failed - will retry next run
    }
  }

  return {
    processed: pendingReminders.length,
    timestamp: now,
  }
}

/**
 * Send email reminder
 */
async function sendEmailReminder(booking: any) {
  const subject = `Reminder: ${booking.eventType.title} in ${formatTimeUntil(booking.startTime)}`

  // Determine meeting link
  let meetingLink = ''
  if (booking.googleMeetLink) {
    meetingLink = `Join via Google Meet: ${booking.googleMeetLink}`
  } else if (booking.teamsMeetLink) {
    meetingLink = `Join via Teams: ${booking.teamsMeetLink}`
  } else if (booking.zoomMeetLink) {
    meetingLink = `Join via Zoom: ${booking.zoomMeetLink}`
  }

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .detail { margin: 15px 0; }
    .label { font-weight: bold; color: #4b5563; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>📅 Booking Reminder</h2>
    </div>
    <div class="content">
      <p>Hi ${booking.guestName},</p>
      <p>This is a reminder about your upcoming booking:</p>

      <div class="detail">
        <span class="label">Event:</span> ${booking.eventType.title}
      </div>
      <div class="detail">
        <span class="label">Date:</span> ${booking.startTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
      <div class="detail">
        <span class="label">Time:</span> ${booking.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${booking.endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div class="detail">
        <span class="label">Timezone:</span> ${booking.timezone}
      </div>

      ${meetingLink ? `
      <div class="detail" style="margin-top: 25px;">
        <a href="${booking.googleMeetLink || booking.teamsMeetLink || booking.zoomMeetLink}" class="button">
          Join Meeting
        </a>
      </div>
      ` : ''}

      ${booking.notes ? `
      <div class="detail" style="margin-top: 20px;">
        <span class="label">Notes:</span><br>
        ${booking.notes}
      </div>
      ` : ''}

      <p style="margin-top: 30px;">See you soon!</p>
    </div>
  </div>
</body>
</html>
`

  const textBody = `
Hi ${booking.guestName},

This is a reminder about your upcoming booking:

Event: ${booking.eventType.title}
Date: ${booking.startTime.toLocaleDateString()}
Time: ${booking.startTime.toLocaleTimeString()}
Timezone: ${booking.timezone}

${meetingLink}

${booking.notes ? `Notes: ${booking.notes}` : ''}

See you soon!
`

  // Check for Resend API key
  const resendApiKey = process.env.RESEND_API_KEY

  if (resendApiKey) {
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(resendApiKey)

      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'BookingSaaS <noreply@bookingsaas.app>',
        to: booking.guestEmail,
        subject,
        html: htmlBody,
        text: textBody,
      })

      console.log(`✅ Email reminder sent to ${booking.guestEmail}`)
    } catch (error) {
      console.error('Failed to send email via Resend:', error)
      throw error
    }
  } else {
    // Fallback: log to console
    console.log('📧 Email reminder (no RESEND_API_KEY configured):', {
      to: booking.guestEmail,
      subject,
      preview: textBody.substring(0, 100) + '...',
    })
  }
}

/**
 * Send SMS reminder
 */
async function sendSMSReminder(booking: any) {
  if (!booking.guestPhone) return

  // Determine meeting link
  let meetingLink = ''
  if (booking.googleMeetLink) {
    meetingLink = ` Join: ${booking.googleMeetLink}`
  } else if (booking.teamsMeetLink) {
    meetingLink = ` Join: ${booking.teamsMeetLink}`
  } else if (booking.zoomMeetLink) {
    meetingLink = ` Join: ${booking.zoomMeetLink}`
  }

  const message = `📅 Reminder: ${booking.eventType.title} at ${booking.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} on ${booking.startTime.toLocaleDateString()}.${meetingLink}`

  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

  if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
    try {
      const twilio = await import('twilio')
      const client = twilio.default(twilioAccountSid, twilioAuthToken)

      await client.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to: booking.guestPhone,
      })

      console.log(`✅ SMS reminder sent to ${booking.guestPhone}`)
    } catch (error) {
      console.error('Failed to send SMS via Twilio:', error)
      throw error
    }
  } else {
    // Fallback: log to console
    console.log('📱 SMS reminder (Twilio not configured):', {
      to: booking.guestPhone,
      message,
    })
  }
}

/**
 * Format time until booking
 */
function formatTimeUntil(date: Date): string {
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))

  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  }

  const days = Math.floor(hours / 24)
  return `${days} day${days !== 1 ? 's' : ''}`
}
