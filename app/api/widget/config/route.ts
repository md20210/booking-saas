import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Helper: Get user from API key or session
async function getUserFromRequest(request: NextRequest) {
  // Try API key first (for cross-domain access)
  const apiKey = request.headers.get('x-api-key')

  if (apiKey) {
    const key = await prisma.apiKey.findUnique({
      where: { key: apiKey, active: true },
      include: { user: true }
    })

    if (key) {
      // Update last used
      await prisma.apiKey.update({
        where: { id: key.id },
        data: { lastUsedAt: new Date() }
      })
      return key.user
    }
  }

  // Fallback to session (same-domain)
  const session = await getServerSession(authOptions)
  if (session?.user?.email) {
    return await prisma.user.findUnique({
      where: { email: session.user.email }
    })
  }

  return null
}

// GET /api/widget/config - Load widget configuration
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - provide API key or login' },
        { status: 401 }
      )
    }

    const designSettings = await prisma.designSettings.findUnique({
      where: { userId: user.id }
    })

    // Return widget configuration
    const config = {
      primaryColor: designSettings?.primaryColor || '#667eea',
      backgroundColor: designSettings?.backgroundColor || '#ffffff',
      textColor: designSettings?.textColor || '#1f2937',
      fontFamily: designSettings?.fontFamily || 'Inter',
      showBranding: designSettings?.showBranding ?? true,
      logoUrl: designSettings?.logoUrl || null,
    }

    return NextResponse.json(config, { status: 200 })
  } catch (error: any) {
    console.error('Error loading widget config:', error)
    return NextResponse.json(
      { error: 'Failed to load configuration' },
      { status: 500 }
    )
  }
}

// POST /api/widget/config - Save widget configuration
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - provide API key or login' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      primaryColor,
      backgroundColor,
      textColor,
      fontFamily,
      showBranding,
      logoUrl
    } = body

    // Upsert design settings
    const designSettings = await prisma.designSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        primaryColor: primaryColor || '#667eea',
        backgroundColor: backgroundColor || '#ffffff',
        textColor: textColor || '#1f2937',
        fontFamily: fontFamily || 'Inter',
        showBranding: showBranding ?? true,
        logoUrl: logoUrl || null,
      },
      update: {
        primaryColor,
        backgroundColor,
        textColor,
        fontFamily,
        showBranding,
        logoUrl,
      }
    })

    return NextResponse.json(
      {
        message: 'Configuration saved successfully',
        config: designSettings
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error saving widget config:', error)
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    )
  }
}

// Public endpoint to get widget config by userId (for embedding)
export async function OPTIONS(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json(
      { error: 'userId required' },
      { status: 400 }
    )
  }

  try {
    const designSettings = await prisma.designSettings.findUnique({
      where: { userId }
    })

    if (!designSettings) {
      // Return default config
      return NextResponse.json({
        primaryColor: '#667eea',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        fontFamily: 'Inter',
        showBranding: true,
        logoUrl: null,
      })
    }

    return NextResponse.json({
      primaryColor: designSettings.primaryColor,
      backgroundColor: designSettings.backgroundColor,
      textColor: designSettings.textColor,
      fontFamily: designSettings.fontFamily,
      showBranding: designSettings.showBranding,
      logoUrl: designSettings.logoUrl,
    })
  } catch (error: any) {
    console.error('Error loading public widget config:', error)
    return NextResponse.json(
      { error: 'Failed to load configuration' },
      { status: 500 }
    )
  }
}
