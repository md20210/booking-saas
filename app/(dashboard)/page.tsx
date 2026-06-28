import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, TrendingUp, Users, DollarSign, Clock, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/api/auth/signin')
  }

  const userId = session.user.id

  // Fetch dashboard metrics
  const [
    totalBookings,
    activeEvents,
    upcomingBookings,
    recentBookings,
    googleIntegration,
    outlookIntegration,
  ] = await Promise.all([
    // Total bookings (all time)
    prisma.booking.count({
      where: {
        eventType: {
          userId,
        },
      },
    }),
    // Active event types
    prisma.eventType.count({
      where: {
        userId,
        active: true,
      },
    }),
    // Upcoming bookings
    prisma.booking.count({
      where: {
        eventType: {
          userId,
        },
        startTime: {
          gte: new Date(),
        },
        status: {
          in: ['CONFIRMED', 'PENDING'],
        },
      },
    }),
    // Recent bookings (last 5)
    prisma.booking.findMany({
      where: {
        eventType: {
          userId,
        },
      },
      include: {
        eventType: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    }),
    // Check calendar integrations
    prisma.googleIntegration.findUnique({
      where: { userId },
      select: { active: true },
    }),
    prisma.outlookIntegration.findUnique({
      where: { userId },
      select: { active: true },
    }),
  ])

  const hasCalendarIntegration = googleIntegration?.active || outlookIntegration?.active

  // Calculate this month's bookings
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const thisMonthBookings = await prisma.booking.count({
    where: {
      eventType: {
        userId,
      },
      createdAt: {
        gte: monthStart,
      },
    },
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {session.user?.name || session.user?.email}
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/events/new">
            <Calendar className="mr-2 h-5 w-5" />
            Create Event Type
          </Link>
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {thisMonthBookings} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Events
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/events/new" className="text-primary hover:underline">
                Create new event
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{upcomingBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Scheduled appointments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Calendar
            </CardTitle>
            {hasCalendarIntegration ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-orange-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {hasCalendarIntegration ? (
                <span className="text-green-600">✓</span>
              ) : (
                <span className="text-orange-500">!</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {hasCalendarIntegration ? (
                'Connected'
              ) : (
                <Link href="/integrations" className="text-primary hover:underline">
                  Connect calendar
                </Link>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Bookings</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/bookings">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first event type to start accepting bookings
              </p>
              <Button asChild>
                <Link href="/events/new">Create Event Type</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{booking.guestName}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.eventType.title} • {booking.guestEmail}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {new Date(booking.startTime).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(booking.startTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Create and manage your booking event types
            </p>
            <Button asChild className="w-full">
              <Link href="/events">Manage Events</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Integrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Connect Google Calendar, Outlook, and more
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/integrations">Setup Integrations</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Design
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Customize your booking widget appearance
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/design">Customize Design</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
