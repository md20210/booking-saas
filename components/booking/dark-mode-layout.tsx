"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, Calendar, User, Mail } from "lucide-react"

interface EventType {
  id: string
  title: string
  description: string | null
  duration: number
  slug: string
}

export function DarkModeLayout({ eventType }: { eventType: EventType }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [trackingParams, setTrackingParams] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" })

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
    return { daysInMonth: lastDay.getDate(), startingDayOfWeek: firstDay.getDay() }
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

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        }),
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-lg w-full border border-gray-700">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-green-400" size={40} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Buchung bestätigt!</h2>
            <p className="text-gray-400 mb-6">
              Dein Termin wurde erfolgreich gebucht. Du erhältst eine Bestätigungs-E-Mail.
            </p>
            <div className="bg-gray-900 rounded-xl p-6 space-y-3 text-left border border-gray-700">
              <div className="flex items-center gap-3 text-gray-300">
                <Calendar size={20} className="text-blue-400" />
                <div>
                  <p className="text-sm text-gray-500">Datum</p>
                  <p className="font-semibold">{selectedDate?.toLocaleDateString('de-DE')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Clock size={20} className="text-blue-400" />
                <div>
                  <p className="text-sm text-gray-500">Zeit</p>
                  <p className="font-semibold">{selectedTime} Uhr</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
          <h1 className="text-4xl font-bold text-white mb-2">{eventType.title}</h1>
          {eventType.description && <p className="text-gray-400 mb-4">{eventType.description}</p>}
          <div className="flex items-center gap-2 text-blue-400 mb-8">
            <Clock size={20} />
            <span className="font-semibold">{eventType.duration} Minuten</span>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Calendar */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                  <ChevronLeft className="text-gray-400" />
                </button>
                <h3 className="text-lg font-semibold text-white">
                  {currentMonth.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                  <ChevronRight className="text-gray-400" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-2">
                {['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-gray-500 py-2">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: startingDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                  const isPast = date < today
                  const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentMonth.getMonth()

                  return (
                    <button
                      key={day}
                      onClick={() => !isPast && setSelectedDate(date)}
                      disabled={isPast}
                      className={`aspect-square rounded-lg font-medium transition-all ${
                        isPast ? 'text-gray-600 cursor-not-allowed' : 'hover:bg-gray-700'
                      } ${isSelected ? 'bg-blue-600 text-white' : 'text-gray-300 bg-gray-700/50'}`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time & Form */}
            <div className="space-y-6">
              {selectedDate && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Verfügbare Zeiten</h3>
                    {loadingSlots ? (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-700 border-t-blue-500" />
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map(slot => (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={`py-3 rounded-lg font-medium transition-all ${
                              selectedTime === slot ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">Keine verfügbaren Zeiten</p>
                    )}
                  </div>

                  {selectedTime && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="text-gray-300 mb-2 block">Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-gray-300 mb-2 block">E-Mail *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-gray-300 mb-2 block">Telefon</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <Button
                        onClick={handleSubmit}
                        disabled={submitting || !formData.name || !formData.email}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6"
                      >
                        {submitting ? 'Wird gebucht...' : 'Jetzt buchen'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
