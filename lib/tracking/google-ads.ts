import { prisma } from '@/lib/db'
import crypto from 'crypto'

/**
 * Hash email or phone for Enhanced Conversions (SHA-256)
 */
function hashValue(value: string): string {
  return crypto.createHash('sha256').update(value.toLowerCase().trim()).digest('hex')
}

/**
 * Send conversion to Google Ads API
 * https://developers.google.com/google-ads/api/docs/conversions/upload-clicks
 */
export async function sendConversionToGoogleAds(
  trackingData: {
    gclid?: string | null
    gbraid?: string | null
    wbraid?: string | null
    conversionDateTime: Date
    conversionValue?: number
    currencyCode?: string
    orderId?: string
  },
  settings: {
    googleAdsAccountId: string
    googleAdsConversionId: string
    googleAdsConversionLabel: string
    enhancedConversionsEnabled: boolean
  },
  enhancedData?: {
    email?: string
    phone?: string
    firstName?: string
    lastName?: string
    countryCode?: string
    postalCode?: string
  }
): Promise<{ success: boolean; response?: any; error?: string }> {
  try {
    // Note: This is a simplified example. In production, you would use the official
    // Google Ads API client library (@google-ads/api-client) with OAuth2 credentials

    // For now, we'll use the Google Ads Conversion Tracking Tag approach (gtag.js)
    // which is client-side. Server-side implementation requires:
    // 1. Google Ads API credentials
    // 2. Google Ads API client library
    // 3. Developer token from Google Ads

    // Example payload structure for Google Ads API:
    const conversionPayload = {
      conversions: [
        {
          // Click identifier (gclid, gbraid, or wbraid)
          ...(trackingData.gclid && { gclid: trackingData.gclid }),
          ...(trackingData.gbraid && { gbraid: trackingData.gbraid }),
          ...(trackingData.wbraid && { wbraid: trackingData.wbraid }),

          // Conversion action
          conversionAction: `customers/${settings.googleAdsAccountId}/conversionActions/${settings.googleAdsConversionId}`,

          // Conversion time
          conversionDateTime: trackingData.conversionDateTime.toISOString(),

          // Conversion value (optional)
          ...(trackingData.conversionValue && {
            conversionValue: trackingData.conversionValue,
          }),
          ...(trackingData.currencyCode && {
            currencyCode: trackingData.currencyCode,
          }),

          // Order ID for deduplication
          ...(trackingData.orderId && { orderId: trackingData.orderId }),

          // Enhanced conversions (if enabled)
          ...(settings.enhancedConversionsEnabled &&
            enhancedData && {
              userIdentifiers: [
                ...(enhancedData.email
                  ? [
                      {
                        hashedEmail: hashValue(enhancedData.email),
                      },
                    ]
                  : []),
                ...(enhancedData.phone
                  ? [
                      {
                        hashedPhoneNumber: hashValue(enhancedData.phone),
                      },
                    ]
                  : []),
              ],
              userAgent: 'BookingSaaS/1.0',
            }),
        },
      ],
      partialFailure: true,
    }

    console.log('Google Ads Conversion Payload:', JSON.stringify(conversionPayload, null, 2))

    // TODO: Implement actual Google Ads API call
    // This would require:
    // const { GoogleAdsApi } = require('google-ads-api');
    // const client = new GoogleAdsApi({ ... });
    // const response = await client.customers.uploadClickConversions(payload);

    // For now, we'll simulate success
    // In production, replace this with actual API call
    return {
      success: true,
      response: {
        message: 'Conversion tracking prepared (server-side implementation pending)',
        payload: conversionPayload,
      },
    }
  } catch (error) {
    console.error('Error sending conversion to Google Ads:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Process pending conversions (for BATCH mode)
 * This would be called by a cron job once per night
 */
export async function processPendingConversions(userId: string) {
  try {
    // Get tracking settings
    const settings = await prisma.trackingSettings.findUnique({
      where: { userId },
    })

    if (!settings || !settings.googleAdsEnabled) {
      return { success: false, error: 'Google Ads tracking not enabled' }
    }

    if (
      !settings.googleAdsAccountId ||
      !settings.googleAdsConversionId ||
      !settings.googleAdsConversionLabel
    ) {
      return { success: false, error: 'Google Ads configuration incomplete' }
    }

    // Get all unsent tracking data for this user's bookings
    const pendingTracking = await prisma.trackingData.findMany({
      where: {
        conversionSent: false,
        booking: {
          userId: userId,
          status: 'CONFIRMED', // Only send confirmed bookings
        },
      },
      include: {
        booking: {
          select: {
            id: true,
            guestEmail: true,
            guestPhone: true,
            guestName: true,
            startTime: true,
            eventType: {
              select: {
                price: true,
                currency: true,
              },
            },
          },
        },
      },
      take: 2000, // Google Ads API limit
    })

    console.log(`Processing ${pendingTracking.length} pending conversions for user ${userId}`)

    const results = []

    for (const tracking of pendingTracking) {
      // Skip if no click identifier
      if (!tracking.gclid && !tracking.gbraid && !tracking.wbraid) {
        console.log(`Skipping tracking ${tracking.id} - no click identifier`)
        continue
      }

      const result = await sendConversionToGoogleAds(
        {
          gclid: tracking.gclid,
          gbraid: tracking.gbraid,
          wbraid: tracking.wbraid,
          conversionDateTime: tracking.booking.startTime,
          conversionValue: tracking.booking.eventType.price
            ? parseFloat(tracking.booking.eventType.price.toString())
            : undefined,
          currencyCode: tracking.booking.eventType.currency,
          orderId: tracking.bookingId,
        },
        {
          googleAdsAccountId: settings.googleAdsAccountId,
          googleAdsConversionId: settings.googleAdsConversionId,
          googleAdsConversionLabel: settings.googleAdsConversionLabel,
          enhancedConversionsEnabled: settings.enhancedConversionsEnabled,
        },
        settings.enhancedConversionsEnabled
          ? {
              email: tracking.booking.guestEmail,
              phone: tracking.booking.guestPhone || undefined,
            }
          : undefined
      )

      if (result.success) {
        // Mark as sent
        await prisma.trackingData.update({
          where: { id: tracking.id },
          data: {
            conversionSent: true,
            conversionSentAt: new Date(),
            conversionResponse: result.response || {},
          },
        })
      }

      results.push({
        trackingId: tracking.id,
        bookingId: tracking.bookingId,
        success: result.success,
        error: result.error,
      })
    }

    // Update last batch sync time
    await prisma.trackingSettings.update({
      where: { userId },
      data: {
        lastBatchSync: new Date(),
      },
    })

    return {
      success: true,
      processed: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    }
  } catch (error) {
    console.error('Error processing pending conversions:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Send a single conversion immediately (for CONTINUOUS mode)
 */
export async function sendConversionImmediately(trackingDataId: string) {
  try {
    const trackingData = await prisma.trackingData.findUnique({
      where: { id: trackingDataId },
      include: {
        booking: {
          include: {
            user: {
              include: {
                trackingSettings: true,
              },
            },
            eventType: {
              select: {
                price: true,
                currency: true,
              },
            },
          },
        },
      },
    })

    if (!trackingData) {
      return { success: false, error: 'Tracking data not found' }
    }

    const settings = trackingData.booking.user.trackingSettings

    if (!settings || !settings.googleAdsEnabled) {
      return { success: false, error: 'Google Ads tracking not enabled' }
    }

    if (
      !settings.googleAdsAccountId ||
      !settings.googleAdsConversionId ||
      !settings.googleAdsConversionLabel
    ) {
      return { success: false, error: 'Google Ads configuration incomplete' }
    }

    // Skip if no click identifier
    if (!trackingData.gclid && !trackingData.gbraid && !trackingData.wbraid) {
      return { success: false, error: 'No click identifier found' }
    }

    const result = await sendConversionToGoogleAds(
      {
        gclid: trackingData.gclid,
        gbraid: trackingData.gbraid,
        wbraid: trackingData.wbraid,
        conversionDateTime: trackingData.booking.startTime,
        conversionValue: trackingData.booking.eventType.price
          ? parseFloat(trackingData.booking.eventType.price.toString())
          : undefined,
        currencyCode: trackingData.booking.eventType.currency,
        orderId: trackingData.bookingId,
      },
      {
        googleAdsAccountId: settings.googleAdsAccountId,
        googleAdsConversionId: settings.googleAdsConversionId,
        googleAdsConversionLabel: settings.googleAdsConversionLabel,
        enhancedConversionsEnabled: settings.enhancedConversionsEnabled,
      },
      settings.enhancedConversionsEnabled
        ? {
            email: trackingData.booking.guestEmail,
            phone: trackingData.booking.guestPhone || undefined,
          }
        : undefined
    )

    if (result.success) {
      await prisma.trackingData.update({
        where: { id: trackingData.id },
        data: {
          conversionSent: true,
          conversionSentAt: new Date(),
          conversionResponse: result.response || {},
        },
      })
    }

    return result
  } catch (error) {
    console.error('Error sending conversion immediately:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
