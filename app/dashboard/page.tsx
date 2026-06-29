import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Plus,
  Share2,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // TODO: Fetch real stats from database
  const stats = {
    totalBookings: 48,
    upcomingEvents: 12,
    revenue: 2850,
    conversionRate: 68
  }

  const upcomingBookings = [
    {
      id: '1',
      clientName: 'John Doe',
      eventType: '30-Minute Meeting',
      time: '2026-06-30 10:00',
      status: 'confirmed'
    },
    {
      id: '2',
      clientName: 'Jane Smith',
      eventType: 'Consultation Call',
      time: '2026-06-30 14:30',
      status: 'confirmed'
    },
    {
      id: '3',
      clientName: 'Mike Johnson',
      eventType: 'Discovery Session',
      time: '2026-07-01 09:00',
      status: 'pending'
    },
  ]

  const recentActivity = [
    {
      id: '1',
      type: 'booking_created',
      message: 'New booking from Sarah Williams',
      time: '2 hours ago',
      icon: CheckCircle2,
      color: 'text-green-600'
    },
    {
      id: '2',
      type: 'payment_received',
      message: 'Payment received: $150',
      time: '5 hours ago',
      icon: DollarSign,
      color: 'text-blue-600'
    },
    {
      id: '3',
      type: 'booking_cancelled',
      message: 'Booking cancelled by Tom Brown',
      time: '1 day ago',
      icon: XCircle,
      color: 'text-red-600'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {session.user?.name || session.user?.email}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Bookings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">+12%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalBookings}</h3>
          <p className="text-sm text-gray-600">Total Bookings</p>
          <p className="text-xs text-gray-500 mt-2">This month</p>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">+8%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.upcomingEvents}</h3>
          <p className="text-sm text-gray-600">Upcoming Events</p>
          <p className="text-xs text-gray-500 mt-2">Next 7 days</p>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">+24%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">${stats.revenue}</h3>
          <p className="text-sm text-gray-600">Revenue</p>
          <p className="text-xs text-gray-500 mt-2">This month</p>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">+5%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.conversionRate}%</h3>
          <p className="text-sm text-gray-600">Conversion Rate</p>
          <p className="text-xs text-gray-500 mt-2">This month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Bookings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Bookings</h2>
            <Link
              href="/bookings"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{booking.clientName}</h3>
                  <p className="text-sm text-gray-600 mt-0.5">{booking.eventType}</p>
                  <p className="text-xs text-gray-500 mt-1">{booking.time}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    booking.status === 'confirmed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {booking.status}
                </span>
              </div>
            ))}
          </div>

          {upcomingBookings.length === 0 && (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No upcoming bookings</p>
              <p className="text-sm text-gray-500 mt-1">Share your booking link to get started</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>

          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = activity.icon
              return (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className={`w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${activity.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {recentActivity.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/events/new"
            className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
              <Plus className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">Create Event Type</h3>
              <p className="text-xs text-gray-500">Set up new booking type</p>
            </div>
          </Link>

          <Link
            href="/bookings/calendar"
            className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
          >
            <div className="w-10 h-10 bg-purple-100 group-hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors">
              <Calendar className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-purple-700">View Calendar</h3>
              <p className="text-xs text-gray-500">See all appointments</p>
            </div>
          </Link>

          <Link
            href="/settings/booking-link"
            className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
          >
            <div className="w-10 h-10 bg-green-100 group-hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors">
              <Share2 className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-green-700">Share Booking Link</h3>
              <p className="text-xs text-gray-500">Get your unique URL</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
