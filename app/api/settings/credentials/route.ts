import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const credentialsSchema = z.object({
  googleOAuthClientId: z.string().optional(),
  googleOAuthClientSecret: z.string().optional(),
  googleAdsDeveloperToken: z.string().optional(),
  googleAdsClientId: z.string().optional(),
  googleAdsClientSecret: z.string().optional(),
  googleAdsRefreshToken: z.string().optional(),
  emailProvider: z.string().optional(),
  emailApiKey: z.string().optional(),
  emailFromAddress: z.string().email().optional().or(z.literal('')),
  emailFromName: z.string().optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.number().int().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  smtpSecure: z.boolean().optional(),
})

/**
 * GET /api/settings/credentials
 * Returns user's API credentials (masked)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const credentials = await prisma.apiCredentials.findUnique({
      where: { userId: session.user.id },
    })

    if (!credentials) {
      return NextResponse.json({ credentials: {} }, { status: 200 })
    }

    // Mask sensitive data for display
    const maskedCredentials = {
      googleOAuthClientId: credentials.googleOAuthClientId
        ? maskString(credentials.googleOAuthClientId)
        : undefined,
      googleOAuthClientSecret: credentials.googleOAuthClientSecret
        ? '••••••••'
        : undefined,
      googleAdsDeveloperToken: credentials.googleAdsDeveloperToken
        ? '••••••••'
        : undefined,
      googleAdsClientId: credentials.googleAdsClientId
        ? maskString(credentials.googleAdsClientId)
        : undefined,
      googleAdsClientSecret: credentials.googleAdsClientSecret
        ? '••••••••'
        : undefined,
      googleAdsRefreshToken: credentials.googleAdsRefreshToken
        ? '••••••••'
        : undefined,
      emailProvider: credentials.emailProvider,
      emailApiKey: credentials.emailApiKey ? '••••••••' : undefined,
      emailFromAddress: credentials.emailFromAddress,
      emailFromName: credentials.emailFromName,
      smtpHost: credentials.smtpHost,
      smtpPort: credentials.smtpPort,
      smtpUser: credentials.smtpUser,
      smtpPassword: credentials.smtpPassword ? '••••••••' : undefined,
      smtpSecure: credentials.smtpSecure,
    }

    return NextResponse.json({ credentials: maskedCredentials }, { status: 200 })
  } catch (error) {
    console.error('GET /api/settings/credentials error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/settings/credentials
 * Save or update user's API credentials
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate request body
    const validationResult = credentialsSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Don't update fields that are masked (••••••••)
    const updateData: any = {}
    Object.entries(data).forEach(([key, value]) => {
      if (value && value !== '••••••••') {
        updateData[key] = value
      }
    })

    // Upsert credentials
    const credentials = await prisma.apiCredentials.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...updateData,
      },
      update: updateData,
    })

    return NextResponse.json(
      { message: 'Credentials saved successfully', credentials },
      { status: 200 }
    )
  } catch (error) {
    console.error('POST /api/settings/credentials error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Helper function to mask sensitive strings
 * Shows first 8 and last 4 characters
 */
function maskString(str: string): string {
  if (str.length <= 12) return '••••••••'
  return `${str.substring(0, 8)}...${str.substring(str.length - 4)}`
}
