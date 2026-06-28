import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/api/auth/signin')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {session.user?.name || session.user?.email}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Event Types Card */}
        <a
          href="/events"
          className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
            <h2 className="text-xl font-semibold">Event Types</h2>
          </div>
          <p className="text-gray-600 text-sm">
            Create and manage your booking event types
          </p>
        </a>

        {/* Bookings Card */}
        <a
          href="/bookings"
          className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
            <h2 className="text-xl font-semibold">Bookings</h2>
          </div>
          <p className="text-gray-600 text-sm">
            View and manage your appointments
          </p>
        </a>

        {/* Integrations Card */}
        <a
          href="/integrations"
          className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔗</span>
            </div>
            <h2 className="text-xl font-semibold">Integrations</h2>
          </div>
          <p className="text-gray-600 text-sm">
            Connect Google Calendar and other services
          </p>
        </a>

        {/* Design Card */}
        <a
          href="/design"
          className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎨</span>
            </div>
            <h2 className="text-xl font-semibold">Design</h2>
          </div>
          <p className="text-gray-600 text-sm">
            Customize your booking widget appearance
          </p>
        </a>

        {/* API Credentials Card */}
        <a
          href="/settings/api"
          className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔑</span>
            </div>
            <h2 className="text-xl font-semibold">API Credentials</h2>
          </div>
          <p className="text-gray-600 text-sm">
            Configure your Google, Ads & Email API keys
          </p>
        </a>

        {/* Settings Card */}
        <a
          href="/settings"
          className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚙️</span>
            </div>
            <h2 className="text-xl font-semibold">Settings</h2>
          </div>
          <p className="text-gray-600 text-sm">
            Account settings and preferences
          </p>
        </a>
      </div>

      {/* Quick Start Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span>🚀</span> Quick Start
        </h3>
        <ol className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="font-semibold text-blue-600">1.</span>
            <span>
              Configure your <a href="/settings/api" className="text-blue-600 underline">API credentials</a> (Google OAuth, Ads, Email)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold text-blue-600">2.</span>
            <span>
              Connect <a href="/integrations" className="text-blue-600 underline">Google Calendar</a>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold text-blue-600">3.</span>
            <span>
              Create your first <a href="/events" className="text-blue-600 underline">Event Type</a>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold text-blue-600">4.</span>
            <span>
              Customize your booking widget in <a href="/design" className="text-blue-600 underline">Design</a>
            </span>
          </li>
        </ol>
      </div>
    </div>
  )
}
