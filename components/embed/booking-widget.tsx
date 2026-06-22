"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, Loader2, Check } from "lucide-react"

interface EmbedBookingWidgetProps {
  eventTypeId: string
  apiKey: string
  baseUrl?: string
}

interface EventType {
  id: string
  title: string
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

export function EmbedBookingWidget({
  eventTypeId,
  apiKey,
  baseUrl = window.location.origin,
}: EmbedBookingWidgetProps) {
  const [eventType, setEventType] = useState<EventType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [step, setStep] = useState<"date" | "time" | "details" | "confirmed">("date")
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

  useEffect(() => {
    fetchEventType()
  }, [eventTypeId])

  useEffect(() => {
    if (selectedDate && eventType) {
      fetchAvailableSlots()
    }
  }, [selectedDate, eventType])

  const fetchEventType = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${baseUrl}/api/embed/event-types/${eventTypeId}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })

      if (!response.ok) {
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
        `${baseUrl}/api/slots?eventTypeId=${eventType.id}&startDate=${startOfDay.toISOString()}&endDate=${endOfDay.toISOString()}`
      )

      if (!response.ok) {
        throw new Error("Failed to fetch slots")
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
      }

      const response = await fetch(`${baseUrl}/api/bookings`, {
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
      setStep("confirmed")
    } catch (err) {
      console.error("Error creating booking:", err)
      alert(err instanceof Error ? err.message : "Failed to create booking")
    } finally {
      setCreating(false)
    }
  }

  const generateCalendar = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      if (date >= new Date(today.setHours(0, 0, 0, 0))) {
        days.push(date)
      } else {
        days.push(null)
      }
    }

    return days
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !eventType) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">{error || "Event not found"}</p>
      </div>
    )
  }

  if (step === "confirmed" && booking) {
    return (
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">Booking Confirmed!</h3>
          <p className="text-gray-600">Check your email for details</p>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{new Date(booking.startTime).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>
              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
            </span>
          </div>
        </div>

        {booking.meetLink && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <a
              href={booking.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm break-all"
            >
              {booking.meetLink}
            </a>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold">{eventType.title}</h2>
        {eventType.description && (
          <p className="text-sm text-gray-600 mt-1">{eventType.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{eventType.duration} minutes</span>
        </div>
      </div>

      {step === "date" && (
        <div>
          <h3 className="font-semibold mb-3">Select a Date</h3>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day} className="text-xs font-medium text-gray-600 py-1">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {generateCalendar().map((date, i) => (
              <button
                key={i}
                disabled={!date}
                onClick={() => {
                  if (date) {
                    setSelectedDate(date)
                    setStep("time")
                  }
                }}
                className={`
                  aspect-square text-sm rounded
                  ${date ? "hover:bg-blue-50 border" : "cursor-not-allowed"}
                  ${
                    selectedDate &&
                    date &&
                    date.toDateString() === selectedDate.toDateString()
                      ? "bg-blue-600 text-white"
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

      {step === "time" && (
        <div>
          <h3 className="font-semibold mb-3">Select a Time</h3>
          {loadingSlots ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <p>No available slots</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep("date")}
                className="mt-4"
              >
                Choose Different Date
              </Button>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableSlots.map((slot, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedSlot(slot)
                    setStep("details")
                  }}
                  className="w-full py-2 px-3 border rounded hover:border-blue-500 hover:bg-blue-50 text-left"
                >
                  {formatTime(slot.start)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === "details" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="font-semibold">Your Details</h3>

          <div>
            <Label htmlFor="name" className="text-sm">
              Name *
            </Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-sm">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm">
              Phone (optional)
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full" disabled={creating}>
            {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Booking
          </Button>
        </form>
      )}
    </div>
  )
}
