import { NextResponse } from 'next/server'
import { processPendingReminders } from '@/lib/email/reminder'

/**
 * Cron endpoint to process pending reminders
 *
 * This endpoint should be called every 5-15 minutes by a cron service like:
 * - Vercel Cron
 * - GitHub Actions
 * - External cron service (cron-job.org)
 *
 * Example cURL:
 * curl -X POST https://yourdomain.com/api/cron/process-reminders \
 *   -H "Authorization: Bearer YOUR_CRON_SECRET"
 */
export async function POST(request: Request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🕐 Processing pending reminders...')

    const result = await processPendingReminders()

    console.log(`✅ Processed ${result.processed} reminders at ${result.timestamp}`)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error('❌ Failed to process reminders:', error)
    return NextResponse.json(
      {
        error: 'Failed to process reminders',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Allow GET for health check
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    endpoint: 'process-reminders',
    instructions: 'POST with Authorization: Bearer YOUR_CRON_SECRET',
  })
}
