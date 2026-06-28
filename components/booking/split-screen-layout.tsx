"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, Clock, CheckCircle2 } from "lucide-react"

interface EventType {
  id: string
  title: string
  description: string | null
  duration: number
  slug: string
}

interface SplitScreenLayoutProps {
  eventType: EventType
}

export function SplitScreenLayout({ eventType }: SplitScreenLayoutProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [trackingParams, setTrackingParams] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })

  // Capture tracking parameters from URL
  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const captured: typeof trackingParams = {}

    if (params.get('gclid')) captured.gclid = params.get('gclid')!
    if (params.get('gbraid')) captured.gbraid = params.get('gbraid')!
    if (params.get('wbraid')) captured.wbraid = params.get('wbraid')!
    if (params.get('utm_source')) captured.utm_source = params.get('utm_source')!
    if (params.get('utm_medium')) captured.utm_medium = params.get('utm_medium')!
    if (params.get('utm_campaign')) captured.utm_campaign = params.get('utm_campaign')!
    if (params.get('utm_term')) captured.utm_term = params.get('utm_term')!
    if (params.get('utm_content')) captured.utm_content = params.get('utm_content')!

    setTrackingParams(captured)
  }, [])

  // Fetch available slots
  useEffect(() => {
    if (!selectedDate) return

    const fetchSlots = async () => {
      setLoadingSlots(true)
      try {
        const dateStr = selectedDate.toISOString().split('T')[0]
        const response = await fetch(`/api/slots?eventTypeId=${eventType.id}&date=${dateStr}`)

        if (response.ok) {
          const data = await response.json()
          setAvailableSlots(data.slots || [])
        }
      } catch (error) {
        console.error('Failed to fetch slots:', error)
      } finally {
        setLoadingSlots(false)
      }
    }

    fetchSlots()
  }, [selectedDate, eventType.id])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) return

    setSubmitting(true)

    try {
      const [hours, minutes] = selectedTime.split(':')
      const startTime = new Date(selectedDate)
      startTime.setHours(parseInt(hours), parseInt(minutes), 0)

      const endTime = new Date(startTime)
      endTime.setMinutes(endTime.getMinutes() + eventType.duration)

      const bookingData = {
        eventTypeId: eventType.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        attendeeName: formData.name,
        attendeeEmail: formData.email,
        attendeePhone: formData.phone || undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        utmParams: Object.keys(trackingParams).length > 0 ? trackingParams : undefined,
        gclid: trackingParams.gclid,
        gbraid: trackingParams.gbraid,
        wbraid: trackingParams.wbraid,
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      })

      if (response.ok) {
        setConfirmed(true)
      } else {
        const error = await response.json()
        alert(error.message || 'Booking failed')
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert('Failed to create booking')
    } finally {
      setSubmitting(false)
    }
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (confirmed) {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Event Info */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-cyan-600 to-teal-700 p-12 items-center justify-center">
          <div className="max-w-md text-white">
            <CheckCircle2 size={64} className="mb-6" />
            <h1 className="text-4xl font-bold mb-4">Erfolgreich gebucht!</h1>
            <p className="text-cyan-100 text-lg">
              Dein Termin wurde bestätigt. Du erhältst in Kürze eine E-Mail mit allen Details.
            </p>
          </div>
        </div>

        {/* Right Side - Confirmation */}
        <div className="w-full lg:w-1/2 p-8 flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="text-green-600" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Buchung bestätigt!</h2>
                <p className="text-gray-600">Wir freuen uns auf den Termin mit dir.</p>
              </div>

              <div className="space-y-4 text-sm">
                <div className="border-t pt-4">
                  <p className="text-gray-600 font-medium mb-1">Datum & Zeit</p>
                  <p className="text-gray-800">{selectedDate?.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="text-gray-800">{selectedTime} Uhr ({eventType.duration} Min.)</p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-gray-600 font-medium mb-1">Kontaktdaten</p>
                  <p className="text-gray-800">{formData.name}</p>
                  <p className="text-gray-800">{formData.email}</p>
                  {formData.phone && <p className="text-gray-800">{formData.phone}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Event Info (Fixed) */}
      <div className="lg:w-1/2 bg-gradient-to-br from-cyan-600 to-teal-700 p-8 lg:p-12 lg:sticky lg:top-0 lg:h-screen flex items-center">
        <div className="max-w-md mx-auto text-white">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">{eventType.title}</h1>
          {eventType.description && (
            <p className="text-cyan-100 text-lg mb-8">{eventType.description}</p>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Clock size={24} />
              <div>
                <p className="text-sm text-cyan-200">Dauer</p>
                <p className="font-semibold text-lg">{eventType.duration} Minuten</p>
              </div>
            </div>

            {selectedDate && (
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <CheckCircle2 size={24} />
                <div>
                  <p className="text-sm text-cyan-200">Gewähltes Datum</p>
                  <p className="font-semibold">{selectedDate.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
              </div>
            )}

            {selectedTime && (
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <Clock size={24} />
                <div>
                  <p className="text-sm text-cyan-200">Gewählte Zeit</p>
                  <p className="font-semibold text-lg">{selectedTime} Uhr</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Booking Form (Scrollable) */}
      <div className="lg:w-1/2 bg-gray-50 p-8 lg:p-12 lg:overflow-y-auto">
        <div className="max-w-md mx-auto">
          {/* Calendar */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="text-cyan-600" />
              </button>
              <h3 className="text-lg font-bold text-gray-800">
                {currentMonth.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="text-cyan-600" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                const isPast = date < today
                const isSelected = selectedDate?.getDate() === day &&
                                  selectedDate?.getMonth() === currentMonth.getMonth()

                return (
                  <button
                    key={day}
                    onClick={() => {
                      if (!isPast) {
                        setSelectedDate(date)
                        setSelectedTime(null)
                      }
                    }}
                    disabled={isPast}
                    className={`
                      aspect-square rounded-lg font-medium transition-all text-sm
                      ${isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-cyan-50'}
                      ${isSelected
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'text-gray-700'
                      }
                    `}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Verfügbare Zeiten</h3>

              {loadingSlots ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-200 border-t-cyan-600" />
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map(slot => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`
                        py-3 px-4 rounded-lg font-medium transition-all text-sm
                        ${selectedTime === slot
                          ? 'bg-cyan-600 text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-cyan-50 border border-gray-200'
                        }
                      `}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">Keine verfügbaren Zeiten</p>
              )}
            </div>
          )}

          {/* Contact Form */}
          {selectedTime && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Deine Kontaktdaten</h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700 mb-2 block">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Max Mustermann"
                    className="border-gray-300"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-700 mb-2 block">E-Mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="max@beispiel.de"
                    className="border-gray-300"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-700 mb-2 block">Telefon (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+49 123 456789"
                    className="border-gray-300"
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !formData.name || !formData.email}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-6 rounded-lg text-base font-semibold"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                      Wird gebucht...
                    </>
                  ) : (
                    'Termin jetzt buchen'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
