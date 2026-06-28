import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { IntegrationsClient } from '@/components/integrations/integrations-client'

export default async function IntegrationsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/api/auth/signin')
  }

  const userId = session.user.id

  // Fetch Google Calendar integration
  const googleIntegration = await prisma.googleIntegration.findUnique({
    where: { userId },
    select: {
      id: true,
      active: true,
      calendarId: true,
      createdAt: true,
    },
  })

  // Fetch Outlook integration
  const outlookIntegration = await prisma.outlookIntegration.findUnique({
    where: { userId },
    select: {
      id: true,
      active: true,
      calendarId: true,
      calendarName: true,
      email: true,
      displayName: true,
      createdAt: true,
    },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-gray-600 mt-2">
          Connect your calendars and other services
        </p>
      </div>

      <IntegrationsClient
        googleIntegration={googleIntegration}
        outlookIntegration={outlookIntegration}
      />
    </div>
  )
}
