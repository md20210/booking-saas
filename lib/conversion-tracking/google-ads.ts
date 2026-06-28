/**
 * Google Ads Conversion Tracking (Server-Side)
 *
 * This module handles server-to-server conversion tracking with Google Ads API.
 * Features:
 * - Offline Conversion Imports
 * - Enhanced Conversions (first-party data hashing)
 * - GCLID-based attribution
 * - Conversion value tracking
 */

import crypto from 'crypto'
import { prisma } from '@/lib/db'

interface GoogleAdsConfig {
  developerToken: string
  clientId: string
  clientSecret: string
  refreshToken: string
  customerId: string
  loginCustomerId?: string
  conversionActionId: string
}

interface ConversionData {
  gclid: string
  conversionDateTime: string // ISO 8601 format
  conversionValue?: number
  currencyCode?: string
  orderId?: string

  // Enhanced Conversions (optional but recommended)
  userIdentifiers?: {
    hashedEmail?: string
    hashedPhoneNumber?: string
  }
}

/**
 * Hash email for Enhanced Conversions
 * Google requires SHA-256 hash of normalized email
 */
export function hashEmail(email: string): string {
  // Normalize: trim, lowercase, remove dots from Gmail
  let normalized = email.trim().toLowerCase()

  if (normalized.endsWith('@gmail.com') || normalized.endsWith('@googlemail.com')) {
    const [localPart, domain] = normalized.split('@')
    normalized = localPart.replace(/\./g, '') + '@' + domain
  }

  return crypto.createHash('sha256').update(normalized).digest('hex')
}

/**
 * Hash phone number for Enhanced Conversions
 * Format: E.164 format (+country_code + number)
 */
export function hashPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let normalized = phone.replace(/\D/g, '')

  // Add + if not present
  if (!normalized.startsWith('+')) {
    // Assume +1 for US if no country code
    normalized = '+1' + normalized
  } else {
    normalized = '+' + normalized
  }

  return crypto.createHash('sha256').update(normalized).digest('hex')
}

/**
 * Get OAuth2 Access Token from Refresh Token
 */
async function getAccessToken(config: GoogleAdsConfig): Promise<string> {
  const tokenUrl = 'https://oauth2.googleapis.com/token'

  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: config.refreshToken,
    grant_type: 'refresh_token'
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
    throw new Error(`Failed to get access token: ${error}`)
  }

  const data = await response.json()
  return data.access_token
}

/**
 * Upload Click Conversion to Google Ads
 *
 * Uses Google Ads API v15
 * Documentation: https://developers.google.com/google-ads/api/rest/reference/rest/v15/customers/uploadClickConversions
 */
export async function uploadClickConversion(
  config: GoogleAdsConfig,
  conversion: ConversionData
): Promise<any> {
  try {
    // Get access token
    const accessToken = await getAccessToken(config)

    // Build conversion object
    const conversionPayload = {
      conversions: [
        {
          gclid: conversion.gclid,
          conversionAction: config.conversionActionId,
          conversionDateTime: conversion.conversionDateTime,
          conversionValue: conversion.conversionValue,
          currencyCode: conversion.currencyCode || 'EUR',
          orderId: conversion.orderId,

          // Enhanced Conversions
          ...(conversion.userIdentifiers && {
            userIdentifiers: [
              ...(conversion.userIdentifiers.hashedEmail ? [{
                hashedEmail: conversion.userIdentifiers.hashedEmail
              }] : []),
              ...(conversion.userIdentifiers.hashedPhoneNumber ? [{
                hashedPhoneNumber: conversion.userIdentifiers.hashedPhoneNumber
              }] : [])
            ]
          })
        }
      ],
      partialFailure: true // Continue even if some conversions fail
    }

    // Upload to Google Ads API
    const apiUrl = `https://googleads.googleapis.com/v15/customers/${config.customerId}:uploadClickConversions`

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'developer-token': config.developerToken
    }

    // Add login-customer-id if using MCC
    if (config.loginCustomerId) {
      headers['login-customer-id'] = config.loginCustomerId
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(conversionPayload)
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Google Ads API Error:', result)
      throw new Error(`Google Ads API error: ${JSON.stringify(result)}`)
    }

    return result
  } catch (error) {
    console.error('Error uploading conversion:', error)
    throw error
  }
}

/**
 * Send Conversion for a Booking
 *
 * This is the main function to call after a booking is confirmed
 */
export async function sendBookingConversion(bookingId: string): Promise<void> {
  try {
    // Get booking with tracking data and user's API credentials
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        trackingData: true,
        eventType: {
          include: {
            user: {
              include: {
                apiCredentials: true,
                trackingSettings: true
              }
            }
          }
        }
      }
    })

    if (!booking) {
      throw new Error('Booking not found')
    }

    // Check if tracking is enabled
    if (!booking.eventType.user.trackingSettings?.googleAdsEnabled) {
      console.log('Google Ads tracking not enabled for this user')
      return
    }

    // Check if conversion already sent
    if (booking.trackingData?.conversionSent) {
      console.log('Conversion already sent for this booking')
      return
    }

    // Check if we have GCLID
    if (!booking.trackingData?.gclid) {
      console.log('No GCLID found for this booking')
      return
    }

    // Get API credentials
    const credentials = booking.eventType.user.apiCredentials
    if (!credentials ||
        !credentials.googleAdsDeveloperToken ||
        !credentials.googleAdsClientId ||
        !credentials.googleAdsClientSecret ||
        !credentials.googleAdsRefreshToken ||
        !credentials.googleAdsCustomerId ||
        !credentials.googleAdsConversionActionId) {
      throw new Error('Google Ads credentials not configured')
    }

    // Build config
    const config: GoogleAdsConfig = {
      developerToken: credentials.googleAdsDeveloperToken,
      clientId: credentials.googleAdsClientId,
      clientSecret: credentials.googleAdsClientSecret,
      refreshToken: credentials.googleAdsRefreshToken,
      customerId: credentials.googleAdsCustomerId,
      loginCustomerId: credentials.googleAdsLoginCustomerId || undefined,
      conversionActionId: credentials.googleAdsConversionActionId
    }

    // Build conversion data
    const conversionData: ConversionData = {
      gclid: booking.trackingData.gclid,
      conversionDateTime: booking.createdAt.toISOString(),
      conversionValue: booking.eventType.price ? Number(booking.eventType.price) : undefined,
      currencyCode: booking.eventType.currency || 'EUR',
      orderId: booking.id,

      // Enhanced Conversions
      userIdentifiers: {
        hashedEmail: hashEmail(booking.guestEmail),
        hashedPhoneNumber: booking.guestPhone ? hashPhoneNumber(booking.guestPhone) : undefined
      }
    }

    // Upload conversion
    const result = await uploadClickConversion(config, conversionData)

    // Update tracking data
    await prisma.trackingData.update({
      where: { bookingId: booking.id },
      data: {
        conversionSent: true,
        conversionSentAt: new Date(),
        conversionResponse: result
      }
    })

    console.log('Conversion sent successfully:', result)
  } catch (error) {
    console.error('Failed to send conversion:', error)

    // Log failure but don't throw - we don't want to break the booking flow
    await prisma.trackingData.update({
      where: { bookingId },
      data: {
        conversionResponse: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }
    }).catch(console.error)
  }
}

/**
 * Batch send conversions (for BATCH tracking mode)
 */
export async function batchSendConversions(userId: string): Promise<void> {
  try {
    // Get all bookings with unsent conversions
    const bookings = await prisma.booking.findMany({
      where: {
        eventType: {
          userId
        },
        trackingData: {
          gclid: {
            not: null
          },
          conversionSent: false
        }
      },
      include: {
        trackingData: true
      }
    })

    console.log(`Found ${bookings.length} bookings with unsent conversions`)

    // Send each conversion
    for (const booking of bookings) {
      await sendBookingConversion(booking.id)

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Update last batch sync time
    await prisma.trackingSettings.update({
      where: { userId },
      data: {
        lastBatchSync: new Date()
      }
    })

    console.log('Batch conversion sending completed')
  } catch (error) {
    console.error('Batch send conversions failed:', error)
    throw error
  }
}
