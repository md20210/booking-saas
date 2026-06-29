import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/widget/config - Load widget configuration
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
      where: { email: session.user.email },
      include: {
        designSettings: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Return widget configuration
    const config = {
      primaryColor: user.designSettings?.primaryColor || '#667eea',
      backgroundColor: user.designSettings?.backgroundColor || '#ffffff',
      textColor: user.designSettings?.textColor || '#1f2937',
      fontFamily: user.designSettings?.fontFamily || 'Inter',
      showBranding: user.designSettings?.showBranding ?? true,
      logoUrl: user.designSettings?.logoUrl || null,
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
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

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
