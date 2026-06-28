"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, TrendingUp, Users, DollarSign, Clock, ArrowUp, ArrowDown } from "lucide-react"

interface AnalyticsData {
  overview: {
    totalBookings: number
    totalRevenue: number
    avgBookingValue: number
    conversionRate: number
    trends: {
      bookings: number
      revenue: number
      conversion: number
    }
  }
  bookingsByDay: { date: string; count: number }[]
  bookingsByEventType: { eventType: string; count: number; revenue: number }[]
  bookingsByStatus: { status: string; count: number }[]
  topPerformers: { eventType: string; bookings: number; revenue: number }[]
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d")

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics?range=${timeRange}`)

      if (!response.ok) {
        throw new Error("Failed to fetch analytics")
      }

      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your booking performance and conversions
          </p>
        </div>
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
          <TabsList>
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="90d">90 Days</TabsTrigger>
            <TabsTrigger value="1y">1 Year</TabsTrigger>
          </TabsList>
        </Tabs>
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
            <div className="text-3xl font-bold">{data?.overview.totalBookings || 0}</div>
            <div className="flex items-center gap-1 mt-1">
              {(data?.overview.trends.bookings || 0) >= 0 ? (
                <ArrowUp className="h-3 w-3 text-green-600" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-600" />
              )}
              <span
                className={`text-xs ${
                  (data?.overview.trends.bookings || 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatPercentage(data?.overview.trends.bookings || 0)}
              </span>
              <span className="text-xs text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(data?.overview.totalRevenue || 0)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {(data?.overview.trends.revenue || 0) >= 0 ? (
                <ArrowUp className="h-3 w-3 text-green-600" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-600" />
              )}
              <span
                className={`text-xs ${
                  (data?.overview.trends.revenue || 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatPercentage(data?.overview.trends.revenue || 0)}
              </span>
              <span className="text-xs text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Booking Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(data?.overview.avgBookingValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Per confirmed booking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversion Rate
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(data?.overview.conversionRate || 0).toFixed(1)}%
            </div>
            <div className="flex items-center gap-1 mt-1">
              {(data?.overview.trends.conversion || 0) >= 0 ? (
                <ArrowUp className="h-3 w-3 text-green-600" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-600" />
              )}
              <span
                className={`text-xs ${
                  (data?.overview.trends.conversion || 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatPercentage(data?.overview.trends.conversion || 0)}
              </span>
              <span className="text-xs text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bookings by Event Type */}
        <Card>
          <CardHeader>
            <CardTitle>Bookings by Event Type</CardTitle>
            <CardDescription>Performance breakdown by event type</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.bookingsByEventType && data.bookingsByEventType.length > 0 ? (
              <div className="space-y-4">
                {data.bookingsByEventType.map((item, index) => {
                  const maxBookings = Math.max(...data.bookingsByEventType.map(e => e.count))
                  const percentage = (item.count / maxBookings) * 100

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.eventType}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground">{item.count} bookings</span>
                          <span className="font-semibold">
                            {formatCurrency(item.revenue)}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No booking data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Status */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Status</CardTitle>
            <CardDescription>Breakdown by status</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.bookingsByStatus && data.bookingsByStatus.length > 0 ? (
              <div className="space-y-4">
                {data.bookingsByStatus.map((item, index) => {
                  const total = data.bookingsByStatus.reduce((sum, s) => sum + s.count, 0)
                  const percentage = (item.count / total) * 100

                  const statusColors: Record<string, string> = {
                    CONFIRMED: "bg-green-500",
                    PENDING: "bg-yellow-500",
                    CANCELLED: "bg-red-500",
                  }

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize">
                          {item.status.toLowerCase()}
                        </span>
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground">{item.count}</span>
                          <span className="font-semibold">{percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            statusColors[item.status] || "bg-primary"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No status data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Events</CardTitle>
          <CardDescription>Your best performing event types</CardDescription>
        </CardHeader>
        <CardContent>
          {data?.topPerformers && data.topPerformers.length > 0 ? (
            <div className="space-y-4">
              {data.topPerformers.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{item.eventType}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.bookings} bookings
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(item.revenue)}</p>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No performance data available yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
