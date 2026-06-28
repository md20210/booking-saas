import { prisma } from '@/lib/db'

export async function createDefaultSetup(userId: string) {
  try {
    // Create default event type
    const defaultEvent = await prisma.eventType.create({
      data: {
        userId,
        title: '30 Minute Meeting',
        slug: '30-minute-meeting',
        description: 'A brief 30-minute meeting to discuss your needs',
        duration: 30,
        bufferTime: 0,
        price: 0,
        currency: 'EUR',
        active: true,
        customFields: [],
      },
    })

    // Create default design settings
    await prisma.designSettings.upsert({
      where: { userId },
      create: {
        userId,
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
      update: {},
    })

    // Create default tracking settings
    await prisma.trackingSettings.upsert({
      where: { userId },
      create: {
        userId,
        googleAdsEnabled: false,
        enhancedConversionsEnabled: false,
        trackingMode: 'CONTINUOUS',
      },
      update: {},
    })

    return {
      defaultEvent,
      message: 'Default setup completed successfully',
    }
  } catch (error) {
    console.error('Error creating default setup:', error)
    throw new Error('Failed to create default setup')
  }
}

export async function checkOnboardingStatus(userId: string) {
  // Check if user has completed key onboarding steps
  const [user, eventTypes, googleIntegration, outlookIntegration] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { onboardingCompleted: true },
    }),
    prisma.eventType.count({
      where: { userId },
    }),
    prisma.googleIntegration.findUnique({
      where: { userId },
      select: { active: true },
    }),
    prisma.outlookIntegration.findUnique({
      where: { userId },
      select: { active: true },
    }),
  ])

  const hasCalendar = googleIntegration?.active || outlookIntegration?.active

  return {
    onboardingCompleted: user?.onboardingCompleted || false,
    hasEventTypes: eventTypes > 0,
    hasCalendar: hasCalendar || false,
    completionPercentage: calculateCompletionPercentage({
      onboardingCompleted: user?.onboardingCompleted || false,
      hasEventTypes: eventTypes > 0,
      hasCalendar: hasCalendar || false,
    }),
  }
}

function calculateCompletionPercentage(status: {
  onboardingCompleted: boolean
  hasEventTypes: boolean
  hasCalendar: boolean
}): number {
  let percentage = 0

  if (status.hasEventTypes) percentage += 40
  if (status.hasCalendar) percentage += 30
  if (status.onboardingCompleted) percentage += 30

  return percentage
}
