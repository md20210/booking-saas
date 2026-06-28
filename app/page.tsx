import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              Booking SaaS
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Multi-Tenant Appointment Scheduling Platform
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-3xl mb-3">📅</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Google Calendar Sync
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Automatic synchronization with Google Calendar and Meet
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Google Ads Tracking
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Per-user conversion tracking with enhanced conversions
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Custom Branding
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                White-label widget with custom colors and styling
              </p>
            </div>
          </div>

          {/* Multi-Tenant Features */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-8 rounded-lg shadow-xl mb-12">
            <h2 className="text-2xl font-bold mb-4">True Multi-Tenant SaaS</h2>
            <p className="text-lg mb-6">
              Each user configures their own API credentials - no shared environment variables
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✓</span>
                <div>
                  <strong>Per-User Google OAuth</strong>
                  <p className="text-sm opacity-90">Own client ID & secret</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">✓</span>
                <div>
                  <strong>Per-User Google Ads API</strong>
                  <p className="text-sm opacity-90">Own developer token & credentials</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">✓</span>
                <div>
                  <strong>Per-User Email Service</strong>
                  <p className="text-sm opacity-90">Resend, SendGrid, or SMTP</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">✓</span>
                <div>
                  <strong>API Key Management</strong>
                  <p className="text-sm opacity-90">Scoped access control</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-colors text-lg"
            >
              Get Started
            </Link>
            <Link
              href="/api/auth/signin"
              className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-lg shadow-lg transition-colors text-lg border-2 border-gray-200"
            >
              Sign In
            </Link>
          </div>

          {/* Tech Stack */}
          <div className="mt-16 text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-2">Built with</p>
            <p className="font-mono">
              Next.js 16 • Prisma • PostgreSQL • NextAuth • Tailwind CSS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
