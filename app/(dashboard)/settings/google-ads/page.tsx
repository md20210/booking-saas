import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { GoogleAdsSetupForm } from '@/components/settings/google-ads-setup-form'

export default async function GoogleAdsSettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/api/auth/signin')
  }

  // Get user's API credentials
  const credentials = await prisma.apiCredentials.findUnique({
    where: { userId: session.user.id },
    select: {
      googleAdsDeveloperToken: true,
      googleAdsClientId: true,
      googleAdsClientSecret: true,
      googleAdsRefreshToken: true,
      googleAdsCustomerId: true,
      googleAdsLoginCustomerId: true,
      googleAdsConversionActionId: true,
    },
  })

  // Get tracking settings
  const trackingSettings = await prisma.trackingSettings.findUnique({
    where: { userId: session.user.id },
    select: {
      googleAdsEnabled: true,
      enhancedConversionsEnabled: true,
      trackingMode: true,
      lastBatchSync: true,
    },
  })

  // Get conversion stats
  const stats = await prisma.trackingData.groupBy({
    by: ['conversionSent'],
    _count: true,
    where: {
      booking: {
        eventType: {
          userId: session.user.id,
        },
      },
      gclid: {
        not: null,
      },
    },
  })

  const totalConversions = stats.reduce((acc, curr) => acc + curr._count, 0)
  const sentConversions = stats.find(s => s.conversionSent)?._count || 0
  const pendingConversions = stats.find(s => !s.conversionSent)?._count || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Google Ads Tracking</h1>
        <p className="text-gray-600 mt-2">
          Configure server-side conversion tracking for Google Ads campaigns
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Conversions</div>
          <div className="text-3xl font-bold text-gray-900">{totalConversions}</div>
          <div className="text-xs text-gray-500 mt-1">All time</div>
        </div>

        <div className="bg-white border border-green-200 rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Sent to Google Ads</div>
          <div className="text-3xl font-bold text-green-600">{sentConversions}</div>
          <div className="text-xs text-gray-500 mt-1">Successfully tracked</div>
        </div>

        <div className="bg-white border border-yellow-200 rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Pending</div>
          <div className="text-3xl font-bold text-yellow-600">{pendingConversions}</div>
          <div className="text-xs text-gray-500 mt-1">Waiting to send</div>
        </div>
      </div>

      {/* Setup Form */}
      <GoogleAdsSetupForm
        credentials={credentials}
        trackingSettings={trackingSettings}
        pendingCount={pendingConversions}
      />

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">📚 How to get your credentials</h3>
        <ol className="space-y-3 text-sm text-blue-800">
          <li className="flex gap-2">
            <span className="font-semibold min-w-[20px]">1.</span>
            <div>
              <strong>Developer Token:</strong> Get from{' '}
              <a
                href="https://ads.google.com/aw/apicenter"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Google Ads API Center
              </a>
            </div>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold min-w-[20px]">2.</span>
            <div>
              <strong>OAuth Credentials:</strong> Create in{' '}
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Google Cloud Console
              </a>{' '}
              (OAuth 2.0 Client ID)
            </div>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold min-w-[20px]">3.</span>
            <div>
              <strong>Refresh Token:</strong> Obtain via OAuth flow (use{' '}
              <a
                href="https://developers.google.com/oauthplayground/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                OAuth Playground
              </a>
              )
            </div>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold min-w-[20px]">4.</span>
            <div>
              <strong>Customer ID:</strong> Find in your Google Ads account (top right, format: 123-456-7890, enter without dashes)
            </div>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold min-w-[20px]">5.</span>
            <div>
              <strong>Conversion Action:</strong> Create in Google Ads under Tools → Conversions, then copy the resource name
            </div>
          </li>
        </ol>
      </div>
    </div>
  )
}
