import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || '30d'

    // Calculate date range
    const now = new Date()
    const daysMap: Record<string, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
    }
    const days = daysMap[range] || 30
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    // Previous period for comparison
    const prevStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000)

    // Fetch bookings for current period
    const bookings = await prisma.booking.findMany({
      where: {
        eventType: {
          userId,
        },
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        eventType: {
          select: {
            title: true,
            price: true,
            currency: true,
          },
        },
      },
    })

    // Fetch bookings for previous period (for trends)
    const prevBookings = await prisma.booking.findMany({
      where: {
        eventType: {
          userId,
        },
        createdAt: {
          gte: prevStartDate,
          lt: startDate,
        },
      },
      include: {
        eventType: {
          select: {
            price: true,
          },
        },
      },
    })

    // Calculate total bookings
    const totalBookings = bookings.length
    const prevTotalBookings = prevBookings.length

    // Calculate total revenue
    const totalRevenue = bookings.reduce((sum, booking) => {
      const price = booking.eventType.price ? Number(booking.eventType.price) : 0
      return sum + price
    }, 0)

    const prevTotalRevenue = prevBookings.reduce((sum, booking) => {
      const price = booking.eventType.price ? Number(booking.eventType.price) : 0
      return sum + price
    }, 0)

    // Calculate average booking value
    const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0

    // Calculate conversion rate (confirmed / total)
    const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED').length
    const conversionRate = totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0

    const prevConfirmedBookings = prevBookings.filter((b) => b.status === 'CONFIRMED').length
    const prevConversionRate =
      prevTotalBookings > 0 ? (prevConfirmedBookings / prevTotalBookings) * 100 : 0

    // Calculate trends
    const bookingsTrend =
      prevTotalBookings > 0
        ? ((totalBookings - prevTotalBookings) / prevTotalBookings) * 100
        : 0
    const revenueTrend =
      prevTotalRevenue > 0 ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100 : 0
    const conversionTrend = prevConversionRate > 0 ? conversionRate - prevConversionRate : 0

    // Bookings by event type
    const bookingsByEventType = Object.values(
      bookings.reduce((acc, booking) => {
        const eventType = booking.eventType.title
        if (!acc[eventType]) {
          acc[eventType] = {
            eventType,
            count: 0,
            revenue: 0,
          }
        }
        acc[eventType].count++
        acc[eventType].revenue += booking.eventType.price ? Number(booking.eventType.price) : 0
        return acc
      }, {} as Record<string, { eventType: string; count: number; revenue: number }>)
    ).sort((a, b) => b.count - a.count)

    // Bookings by status
    const bookingsByStatus = Object.values(
      bookings.reduce((acc, booking) => {
        const status = booking.status
        if (!acc[status]) {
          acc[status] = {
            status,
            count: 0,
          }
        }
        acc[status].count++
        return acc
      }, {} as Record<string, { status: string; count: number }>)
    )

    // Top performers
    const topPerformers = bookingsByEventType.slice(0, 5)

    // Bookings by day (last 7 days for simplicity)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      date.setHours(0, 0, 0, 0)
      return date
    }).reverse()

    const bookingsByDay = last7Days.map((date) => {
      const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000)
      const count = bookings.filter((b) => {
        const bookingDate = new Date(b.createdAt)
        return bookingDate >= date && bookingDate < nextDay
      }).length

      return {
        date: date.toISOString().split('T')[0],
        count,
      }
    })

    return NextResponse.json({
      overview: {
        totalBookings,
        totalRevenue,
        avgBookingValue,
        conversionRate,
        trends: {
          bookings: bookingsTrend,
          revenue: revenueTrend,
          conversion: conversionTrend,
        },
      },
      bookingsByDay,
      bookingsByEventType,
      bookingsByStatus,
      topPerformers,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
