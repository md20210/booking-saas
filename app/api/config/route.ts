import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/config - Load complete booking configuration
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get all config from database
    const designSettings = await prisma.designSettings.findUnique({
      where: { userId: user.id }
    })

    // Get Google credentials from env vars for now (should be encrypted in DB later)
    const config = {
      // Basic
      eventTitle: '30min Beratungsgespräch',
      eventDescription: 'Persönliches Video-Gespräch über Ihre AI-Strategie',
      price: 0,
      currency: 'EUR',
      duration: 30,
      bufferTime: 0,
      timeRange: '9-17',
      videoProvider: 'google_meet',

      // Google (from env)
      googleClientId: process.env.GOOGLE_CLIENT_ID || '',
      googleCalendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      googleAdsConversionId: '',
      googleAdsConversionLabel: '',
      googleAnalyticsId: '',

      // Design
      primaryColor: designSettings?.primaryColor || '#667eea',
      backgroundColor: designSettings?.backgroundColor || '#ffffff',
      textColor: designSettings?.textColor || '#1f2937',
      fontFamily: designSettings?.fontFamily || 'Inter',
      logoUrl: designSettings?.logoUrl || ''
    }

    return NextResponse.json(config, { status: 200 })
  } catch (error: any) {
    console.error('Error loading config:', error)
    return NextResponse.json(
      { error: 'Failed to load configuration' },
      { status: 500 }
    )
  }
}

// POST /api/config - Save complete booking configuration
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Save design settings
    await prisma.designSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        primaryColor: body.primaryColor || '#667eea',
        backgroundColor: body.backgroundColor || '#ffffff',
        textColor: body.textColor || '#1f2937',
        fontFamily: body.fontFamily || 'Inter',
        showBranding: true,
        logoUrl: body.logoUrl || null,
      },
      update: {
        primaryColor: body.primaryColor,
        backgroundColor: body.backgroundColor,
        textColor: body.textColor,
        fontFamily: body.fontFamily,
        logoUrl: body.logoUrl,
      }
    })

    // TODO: Save event config, Google credentials (encrypted), etc.
    // For now we only save design settings

    return NextResponse.json(
      { message: 'Configuration saved successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error saving config:', error)
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    )
  }
}
