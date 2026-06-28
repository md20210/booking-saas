"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Loader2, Calendar, Clock, User, Mail } from "lucide-react"

export default function BookingSuccessPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const sessionId = searchParams.get("session_id")

  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionId) {
      verifyPayment()
    } else {
      setError("No payment session found")
      setLoading(false)
    }
  }, [sessionId])

  const verifyPayment = async () => {
    try {
      const response = await fetch(`/api/stripe/verify?session_id=${sessionId}`)

      if (!response.ok) {
        throw new Error("Payment verification failed")
      }

      const data = await response.json()
      setBooking(data.booking)
    } catch (err) {
      console.error("Error verifying payment:", err)
      setError(err instanceof Error ? err.message : "Failed to verify payment")
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Payment Verification Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{error || "Unable to verify payment"}</p>
            <Button asChild>
              <a href={`/book/${slug}`}>Try Again</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>Your booking has been confirmed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">{booking.eventType.title}</h3>
                {booking.eventType.description && (
                  <p className="text-gray-600 text-sm">{booking.eventType.description}</p>
                )}
              </div>

              <div className="grid gap-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="h-5 w-5" />
                  <span>{formatDate(booking.startTime)}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="h-5 w-5" />
                  <span>
                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <User className="h-5 w-5" />
                  <span>{booking.guestName}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="h-5 w-5" />
                  <span>{booking.guestEmail}</span>
                </div>
              </div>

              {(booking.googleMeetLink || booking.teamsMeetLink) && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">Join the meeting:</p>
                  <a
                    href={booking.googleMeetLink || booking.teamsMeetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {booking.googleMeetLink || booking.teamsMeetLink}
                  </a>
                </div>
              )}

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-900 mb-1">
                  Payment confirmed
                </p>
                <p className="text-xs text-green-700">
                  Amount: {booking.paymentCurrency} {booking.paymentAmount}
                </p>
              </div>

              <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
                <p>
                  A calendar invitation and confirmation email have been sent to your email address.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1" asChild>
                <a href={`/book/${slug}`}>Book Another Meeting</a>
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <a href="/">Go Home</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
