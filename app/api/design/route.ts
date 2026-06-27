import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Validation schema for design settings
const designSettingsSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').default('#3b82f6'),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').default('#ffffff'),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').default('#1f2937'),
  borderColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').default('#e5e7eb'),
  fontFamily: z.string().min(1).max(100).default('Inter'),
  headingFontSize: z.string().regex(/^\d+px$/, 'Font size must be in px (e.g., 24px)').default('24px'),
  bodyFontSize: z.string().regex(/^\d+px$/, 'Font size must be in px (e.g., 16px)').default('16px'),
  buttonFontSize: z.string().regex(/^\d+px$/, 'Font size must be in px (e.g., 16px)').default('16px'),
  widgetWidth: z.string().regex(/^(\d+px|auto|\d+%)$/, 'Width must be in px, %, or auto').default('800px'),
  widgetHeight: z.string().regex(/^(\d+px|auto|\d+%)$/, 'Height must be in px, %, or auto').default('auto'),
  layoutVariant: z.enum(['calendar-left', 'calendar-right', 'compact', 'slots-only']).default('calendar-left'),
  logoUrl: z.string().url().optional().or(z.literal('')),
  showBranding: z.boolean().default(true),
  customCss: z.string().max(10000, 'Custom CSS too long').optional().or(z.literal('')),
})

/**
 * GET /api/design
 * Returns design settings for the authenticated user
 * Creates default settings if they don't exist
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find existing design settings
    let designSettings = await prisma.designSettings.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
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
        createdAt: true,
        updatedAt: true,
      },
    })

    // Create default settings if they don't exist
    if (!designSettings) {
      designSettings = await prisma.designSettings.create({
        data: {
          userId: session.user.id,
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
        select: {
          id: true,
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
          createdAt: true,
          updatedAt: true,
        },
      })
    }

    return NextResponse.json({ designSettings }, { status: 200 })
  } catch (error) {
    console.error('GET /api/design error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/design
 * Updates design settings for the authenticated user
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate request body
    const validationResult = designSettingsSchema.safeParse(body)

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

    // Upsert design settings (update if exists, create if doesn't)
    const designSettings = await prisma.designSettings.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        primaryColor: data.primaryColor,
        backgroundColor: data.backgroundColor,
        textColor: data.textColor,
        borderColor: data.borderColor,
        fontFamily: data.fontFamily,
        headingFontSize: data.headingFontSize,
        bodyFontSize: data.bodyFontSize,
        buttonFontSize: data.buttonFontSize,
        widgetWidth: data.widgetWidth,
        widgetHeight: data.widgetHeight,
        layoutVariant: data.layoutVariant,
        logoUrl: data.logoUrl || null,
        showBranding: data.showBranding,
        customCss: data.customCss || null,
      },
      create: {
        userId: session.user.id,
        primaryColor: data.primaryColor,
        backgroundColor: data.backgroundColor,
        textColor: data.textColor,
        borderColor: data.borderColor,
        fontFamily: data.fontFamily,
        headingFontSize: data.headingFontSize,
        bodyFontSize: data.bodyFontSize,
        buttonFontSize: data.buttonFontSize,
        widgetWidth: data.widgetWidth,
        widgetHeight: data.widgetHeight,
        layoutVariant: data.layoutVariant,
        logoUrl: data.logoUrl || null,
        showBranding: data.showBranding,
        customCss: data.customCss || null,
      },
      select: {
        id: true,
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
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ designSettings }, { status: 200 })
  } catch (error) {
    console.error('PUT /api/design error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
