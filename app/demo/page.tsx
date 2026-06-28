import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function DemoPage() {
  const session = await getServerSession(authOptions)

  // Get first public event to demo
  const publicEvent = await prisma.eventType.findFirst({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      duration: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            BookingSaaS Widget Demo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            See the booking widget in action
          </p>

          {!session && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 inline-block">
              <p className="text-blue-800 mb-2">
                Want to create your own booking widgets?
              </p>
              <div className="flex gap-3 justify-center">
                <Link
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Sign Up Free
                </Link>
                <Link
                  href="/api/auth/signin"
                  className="bg-white hover:bg-gray-50 text-blue-600 px-6 py-2 rounded-lg font-semibold border border-blue-200 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Widget Demo */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-4">Live Widget</h2>
            {publicEvent ? (
              <div className="border rounded-lg overflow-hidden">
                <iframe
                  src={`/book/${publicEvent.slug}`}
                  className="w-full h-[600px] border-0"
                  title="Booking Widget Demo"
                />
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <p className="text-gray-600 mb-4">
                  No demo event available yet.
                </p>
                {session ? (
                  <Link
                    href="/events/new"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold inline-block transition-colors"
                  >
                    Create Your First Event
                  </Link>
                ) : (
                  <Link
                    href="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold inline-block transition-colors"
                  >
                    Sign Up to Create Events
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Embed Code */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-4">How to Embed</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2 text-lg">📋 Option 1: Simple Iframe</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Just copy and paste this code into your website:
                </p>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
{publicEvent ? `<iframe
  src="https://booking-saas-production-c352.up.railway.app/book/${publicEvent.slug}"
  width="100%"
  height="600"
  frameborder="0"
></iframe>` : '<!-- Create an event first -->'}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-lg">⚡ Option 2: JavaScript Widget</h3>
                <p className="text-sm text-gray-600 mb-2">
                  For advanced customization with tracking:
                </p>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
{`<script src="https://booking-saas-production-c352.up.railway.app/embed.js"></script>
<div id="booking-widget"></div>
<script>
  new MyBookingEmbed({
    containerId: 'booking-widget',
    apiUrl: 'https://booking-saas-production-c352.up.railway.app',
    apiKey: 'your-api-key',
    eventId: 'your-event-id'
  });
</script>`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-lg">🎨 Features</h3>
                <ul className="text-sm space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Responsive design (mobile & desktop)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Real-time availability</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Google Calendar sync</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Email notifications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Google Meet links</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Custom branding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Analytics & tracking</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">1️⃣</span>
              </div>
              <h3 className="font-semibold mb-2">Create Account</h3>
              <p className="text-sm text-gray-600">
                Sign up for free and set up your profile
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">2️⃣</span>
              </div>
              <h3 className="font-semibold mb-2">Configure Event</h3>
              <p className="text-sm text-gray-600">
                Define your service, duration, and availability
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">3️⃣</span>
              </div>
              <h3 className="font-semibold mb-2">Embed Widget</h3>
              <p className="text-sm text-gray-600">
                Copy the code and paste it on your website
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">4️⃣</span>
              </div>
              <h3 className="font-semibold mb-2">Accept Bookings</h3>
              <p className="text-sm text-gray-600">
                Receive bookings and manage them in your dashboard
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        {!session && (
          <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-6 opacity-90">
              Create your first booking widget in under 5 minutes
            </p>
            <Link
              href="/register"
              className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-3 rounded-lg font-bold text-lg inline-block transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
