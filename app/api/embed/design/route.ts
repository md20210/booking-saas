import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/embed/design
 * Returns design settings for embed widget (requires API key authentication)
 */
export async function GET(request: NextRequest) {
  try {
    // Get API key from Authorization header
    const authHeader = request.headers.get('Authorization')
    const apiKey = authHeader?.replace('Bearer ', '')

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required' },
        { status: 401 }
      )
    }

    // Validate API key
    const validApiKey = await prisma.apiKey.findUnique({
      where: {
        key: apiKey,
        active: true,
      },
    })

    if (!validApiKey) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }

    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: validApiKey.id },
      data: { lastUsedAt: new Date() },
    })

    // Fetch design settings
    const designSettings = await prisma.designSettings.findUnique({
      where: {
        userId: validApiKey.userId,
      },
      select: {
        primaryColor: true,
        backgroundColor: true,
        textColor: true,
        borderColor: true,
        fontFamily: true,
        headingFontSize: true,
        bodyFontSize: true,
        buttonFontSize: true,
        widgetWidth: true,
        widgetHeight: true,
        layoutVariant: true,
        logoUrl: true,
        showBranding: true,
        customCss: true,
      },
    })

    // Return default settings if none exist
    if (!designSettings) {
      return NextResponse.json(
        {
          designSettings: {
            primaryColor: '#3b82f6',
            backgroundColor: '#ffffff',
            textColor: '#1f2937',
            borderColor: '#e5e7eb',
            fontFamily: 'Inter',
            headingFontSize: '24px',
            bodyFontSize: '16px',
            buttonFontSize: '16px',
            widgetWidth: '800px',
            widgetHeight: 'auto',
            layoutVariant: 'calendar-left',
            showBranding: true,
          },
        },
        { status: 200 }
      )
    }

    return NextResponse.json({ designSettings }, { status: 200 })
  } catch (error) {
    console.error('GET /api/embed/design error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
