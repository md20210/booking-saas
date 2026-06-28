"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Calendar, Clock, User, Mail, Phone, Check, Loader2, ArrowLeft } from "lucide-react"

interface EventType {
  id: string
  title: string
  slug: string
  description?: string
  duration: number
  price?: number
  currency: string
}

interface TimeSlot {
  start: string
  end: string
  duration: number
  available: boolean
}

type BookingStep = "select-date" | "select-time" | "enter-details" | "confirmed"

export default function PublicBookingPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string

  const [eventType, setEventType] = useState<EventType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [currentStep, setCurrentStep] = useState<BookingStep>("select-date")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const [booking, setBooking] = useState<any>(null)
  const [creating, setCreating] = useState(false)

  // Capture UTM params and GCLID from URL
  const utmParams = {
    utm_source: searchParams.get("utm_source") || undefined,
    utm_medium: searchParams.get("utm_medium") || undefined,
    utm_campaign: searchParams.get("utm_campaign") || undefined,
    utm_term: searchParams.get("utm_term") || undefined,
    utm_content: searchParams.get("utm_content") || undefined,
  }

  const gclid = searchParams.get("gclid") || undefined
  const gbraid = searchParams.get("gbraid") || undefined
  const wbraid = searchParams.get("wbraid") || undefined

  useEffect(() => {
    fetchEventType()
  }, [slug])

  useEffect(() => {
    if (selectedDate && eventType) {
      fetchAvailableSlots()
    }
  }, [selectedDate, eventType])

  const fetchEventType = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/public/events/${slug}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Event not found")
        }
        throw new Error("Failed to load event")
      }

      const data = await response.json()
      setEventType(data.eventType)
    } catch (err) {
      console.error("Error fetching event type:", err)
      setError(err instanceof Error ? err.message : "Failed to load event")
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableSlots = async () => {
    if (!eventType || !selectedDate) return

    try {
      setLoadingSlots(true)

      const startOfDay = new Date(selectedDate)
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(selectedDate)
      endOfDay.setHours(23, 59, 59, 999)

      const response = await fetch(
        `/api/slots?eventTypeId=${eventType.id}&startDate=${startOfDay.toISOString()}&endDate=${endOfDay.toISOString()}`
      )

      if (!response.ok) {
        throw new Error("Failed to fetch available slots")
      }

      const data = await response.json()
      setAvailableSlots(data.slots || [])
    } catch (err) {
      console.error("Error fetching slots:", err)
      setAvailableSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedSlot(null)
    setCurrentStep("select-time")
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    setCurrentStep("enter-details")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!eventType || !selectedSlot) return

    try {
      setCreating(true)

      const bookingData = {
        eventTypeId: eventType.id,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        attendeeName: formData.name,
        attendeeEmail: formData.email,
        attendeePhone: formData.phone || undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        utmParams: Object.values(utmParams).some((v) => v) ? utmParams : undefined,
        gclid,
        gbraid,
        wbraid,
      }

      // If event has a price, redirect to Stripe Checkout
      if (eventType.price && eventType.price > 0) {
        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingData),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to create payment session")
        }

        // Redirect to Stripe Checkout
        if (result.url) {
          window.location.href = result.url
          return
        }
      } else {
        // Free booking - create directly
        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingData),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to create booking")
        }

        setBooking(result.booking)
        setCurrentStep("confirmed")
      }
    } catch (err) {
      console.error("Error creating booking:", err)
      alert(err instanceof Error ? err.message : "Failed to create booking")
      setCreating(false)
    }
  }

  const handleBack = () => {
    if (currentStep === "select-time") {
      setCurrentStep("select-date")
      setSelectedDate(null)
    } else if (currentStep === "enter-details") {
      setCurrentStep("select-time")
      setSelectedSlot(null)
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Generate calendar for current month
  const generateCalendar = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      // Only add future dates
      if (date >= new Date(today.setHours(0, 0, 0, 0))) {
        days.push(date)
      } else {
        days.push(null)
      }
    }

    return days
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    )
  }

  if (error || !eventType) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{error || "Event not found"}</p>
            <Button asChild>
              <a href="/">Go Home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentStep === "confirmed" && booking) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
              <CardDescription>
                {booking.status === "confirmed"
                  ? "Your meeting has been scheduled"
                  : "Your booking request has been submitted"}
              </CardDescription>
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
                    <span>
                      {formatDate(new Date(booking.startTime))}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="h-5 w-5" />
                    <span>
                      {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="h-5 w-5" />
                    <span>{booking.attendeeName}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="h-5 w-5" />
                    <span>{booking.attendeeEmail}</span>
                  </div>
                </div>

                {booking.meetLink && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">Join the meeting:</p>
                    <a
                      href={booking.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {booking.meetLink}
                    </a>
                  </div>
                )}

                <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
                  <p>
                    {booking.status === "confirmed"
                      ? "A calendar invitation and confirmation email have been sent to your email address."
                      : "You will receive a confirmation email once your booking has been approved by the event owner."}
                  </p>
                </div>
              </div>

              <Button className="w-full" onClick={() => window.location.reload()}>
                Book Another Meeting
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{eventType.title}</h1>
          {eventType.description && (
            <p className="text-gray-600">{eventType.description}</p>
          )}
          <div className="flex items-center gap-4 mt-4 text-gray-700">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>{eventType.duration} minutes</span>
            </div>
            {eventType.price && eventType.price > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {eventType.currency} {eventType.price}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Booking Steps */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Calendar/Selection */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {currentStep === "select-date" && "Select a Date"}
                    {currentStep === "select-time" && "Select a Time"}
                    {currentStep === "enter-details" && "Your Details"}
                  </span>
                  {currentStep !== "select-date" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBack}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentStep === "select-date" && (
                  <div>
                    <div className="grid grid-cols-7 gap-2 text-center mb-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div key={day} className="text-xs font-medium text-gray-600 py-2">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {generateCalendar().map((date, i) => (
                        <button
                          key={i}
                          disabled={!date}
                          onClick={() => date && handleDateSelect(date)}
                          className={`
                            aspect-square flex items-center justify-center rounded-lg text-sm
                            transition-colors
                            ${
                              date
                                ? "hover:bg-blue-50 border border-gray-200 hover:border-blue-500"
                                : "cursor-not-allowed"
                            }
                            ${
                              selectedDate &&
                              date &&
                              date.toDateString() === selectedDate.toDateString()
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : ""
                            }
                          `}
                        >
                          {date && date.getDate()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === "select-time" && (
                  <div>
                    {loadingSlots ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="text-center py-12 text-gray-600">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>No available slots for this date</p>
                        <p className="text-sm mt-2">Please select a different date</p>
                      </div>
                    ) : (
                      <div className="grid gap-2 max-h-[400px] overflow-y-auto">
                        {availableSlots.map((slot, i) => (
                          <button
                            key={i}
                            onClick={() => handleSlotSelect(slot)}
                            className="w-full py-3 px-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{formatTime(slot.start)}</span>
                              <span className="text-sm text-gray-600">
                                {slot.duration} min
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {currentStep === "enter-details" && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone (optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+1 234 567 8900"
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={creating}>
                      {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {eventType.price && eventType.price > 0
                        ? `Proceed to Payment (${eventType.currency} ${eventType.price})`
                        : "Confirm Booking"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 mt-0.5 text-gray-600" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-gray-600">{formatDate(selectedDate)}</p>
                    </div>
                  </div>
                )}

                {selectedSlot && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 mt-0.5 text-gray-600" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-gray-600">
                        {formatTime(selectedSlot.start)} - {formatTime(selectedSlot.end)}
                      </p>
                    </div>
                  </div>
                )}

                {formData.name && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 mt-0.5 text-gray-600" />
                    <div>
                      <p className="font-medium">Name</p>
                      <p className="text-gray-600">{formData.name}</p>
                    </div>
                  </div>
                )}

                {formData.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 mt-0.5 text-gray-600" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-gray-600 break-all">{formData.email}</p>
                    </div>
                  </div>
                )}

                {!selectedDate && !selectedSlot && (
                  <p className="text-gray-500 text-sm">
                    Select a date and time to continue
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
