import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Validation schema for tracking settings
const trackingSettingsSchema = z.object({
  googleAdsEnabled: z.boolean(),
  googleAdsAccountId: z.string().optional().or(z.literal('')),
  googleAdsConversionId: z.string().optional().or(z.literal('')),
  googleAdsConversionLabel: z.string().optional().or(z.literal('')),
  enhancedConversionsEnabled: z.boolean(),
  trackingMode: z.enum(['CONTINUOUS', 'BATCH']),
})

/**
 * GET /api/tracking/settings
 * Returns tracking settings for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find or create tracking settings
    let trackingSettings = await prisma.trackingSettings.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!trackingSettings) {
      trackingSettings = await prisma.trackingSettings.create({
        data: {
          userId: session.user.id,
          googleAdsEnabled: false,
          trackingMode: 'CONTINUOUS',
          enhancedConversionsEnabled: false,
        },
      })
    }

    return NextResponse.json({ trackingSettings }, { status: 200 })
  } catch (error) {
    console.error('GET /api/tracking/settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/tracking/settings
 * Updates tracking settings for the authenticated user
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate request body
    const validationResult = trackingSettingsSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // If Google Ads is enabled, require conversion settings
    if (data.googleAdsEnabled) {
      if (!data.googleAdsAccountId || !data.googleAdsConversionId || !data.googleAdsConversionLabel) {
        return NextResponse.json(
          {
            error: 'Invalid Google Ads configuration',
            message: 'Account ID, Conversion ID, and Conversion Label are required when Google Ads tracking is enabled',
          },
          { status: 400 }
        )
      }
    }

    // Upsert tracking settings
    const trackingSettings = await prisma.trackingSettings.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        googleAdsEnabled: data.googleAdsEnabled,
        googleAdsAccountId: data.googleAdsAccountId || null,
        googleAdsConversionId: data.googleAdsConversionId || null,
        googleAdsConversionLabel: data.googleAdsConversionLabel || null,
        enhancedConversionsEnabled: data.enhancedConversionsEnabled,
        trackingMode: data.trackingMode,
      },
      create: {
        userId: session.user.id,
        googleAdsEnabled: data.googleAdsEnabled,
        googleAdsAccountId: data.googleAdsAccountId || null,
        googleAdsConversionId: data.googleAdsConversionId || null,
        googleAdsConversionLabel: data.googleAdsConversionLabel || null,
        enhancedConversionsEnabled: data.enhancedConversionsEnabled,
        trackingMode: data.trackingMode,
      },
    })

    return NextResponse.json({ trackingSettings }, { status: 200 })
  } catch (error) {
    console.error('PUT /api/tracking/settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
