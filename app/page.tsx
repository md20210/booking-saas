import Navbar from '@/components/navigation/Navbar'
import Link from 'next/link'
import { Calendar, Video, Bell, CreditCard, Users, Zap, Globe, Shield } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: Calendar,
      title: 'Calendar Sync',
      description: 'Automatic synchronization with Google Calendar and Outlook. Never double-book again.',
    },
    {
      icon: Video,
      title: 'Video Conferencing',
      description: 'Built-in support for Google Meet, Microsoft Teams, and Zoom with automatic link generation.',
    },
    {
      icon: Bell,
      title: 'Smart Reminders',
      description: 'Email and SMS reminders sent automatically 1 hour, 24 hours, or 1 week before appointments.',
    },
    {
      icon: CreditCard,
      title: 'Payment Processing',
      description: 'Accept payments with Stripe. Support for multiple currencies and automatic invoicing.',
    },
    {
      icon: Users,
      title: 'Team Scheduling',
      description: 'Round-robin scheduling, team availability, and role-based access control.',
    },
    {
      icon: Zap,
      title: 'Webhooks & API',
      description: 'Integrate with Zapier, n8n, or Make. Full REST API for custom integrations.',
    },
    {
      icon: Globe,
      title: 'White Label',
      description: 'Custom branding, your domain, your colors. No "Powered by" badges.',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'SOC 2 compliant, GDPR ready, encrypted data, and role-based permissions.',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-16 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Scheduling Made
                <span className="text-blue-600"> Simple</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Professional appointment scheduling with video calls, reminders & payments built in.
                Everything you need to manage bookings efficiently.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 text-lg font-semibold rounded-lg shadow-md border-2 border-gray-200 transition-all"
                >
                  See Features
                </Link>
              </div>
              <p className="mt-6 text-sm text-gray-500">
                Trusted by 10,000+ professionals worldwide
              </p>
            </div>

            {/* Right Image/Demo */}
            <div className="relative hidden lg:block">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="bg-white rounded-lg p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="grid grid-cols-7 gap-2 mt-6">
                    {[...Array(35)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-8 rounded ${
                          i % 7 === 3 ? 'bg-blue-500' : 'bg-gray-100'
                        }`}
                      ></div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <div className="h-10 bg-blue-500 rounded flex-1"></div>
                    <div className="h-10 bg-gray-200 rounded flex-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to manage bookings
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              All the features of Calendly, plus more. Built for teams, agencies, and enterprises.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                  <feature.icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to streamline your scheduling?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who trust CalendarPro
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-100 text-blue-600 text-lg font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-6 h-6 text-blue-600" />
                <span className="text-lg font-bold text-gray-900">CalendarPro</span>
              </div>
              <p className="text-sm text-gray-600">
                Professional appointment scheduling platform
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#features" className="hover:text-gray-900">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-gray-900">Pricing</Link></li>
                <li><Link href="#" className="hover:text-gray-900">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#about" className="hover:text-gray-900">About</Link></li>
                <li><Link href="#" className="hover:text-gray-900">Blog</Link></li>
                <li><Link href="#" className="hover:text-gray-900">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-gray-900">Privacy</Link></li>
                <li><Link href="#" className="hover:text-gray-900">Terms</Link></li>
                <li><Link href="#" className="hover:text-gray-900">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>© 2026 CalendarPro. All rights reserved.</p>
            <p className="mt-2 text-xs">
              Built with Next.js 16 • Prisma • PostgreSQL • Stripe • Tailwind CSS
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
