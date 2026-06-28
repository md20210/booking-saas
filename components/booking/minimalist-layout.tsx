"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface EventType { id: string; title: string; description: string | null; duration: number; slug: string }

export function MinimalistLayout({ eventType }: { eventType: EventType }) {
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
    if (params.get('utm_source')) captured.utm_source = params.get('utm_source')!
    setTrackingParams(captured)
  }, [])

  useEffect(() => {
    if (!selectedDate) return
    const fetchSlots = async () => {
      setLoadingSlots(true)
      try {
        const response = await fetch(`/api/slots?eventTypeId=${eventType.id}&date=${selectedDate.toISOString().split('T')[0]}`)
        if (response.ok) setAvailableSlots((await response.json()).slots || [])
      } finally { setLoadingSlots(false) }
    }
    fetchSlots()
  }, [selectedDate, eventType.id])

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
          eventTypeId: eventType.id, startTime: startTime.toISOString(), endTime: endTime.toISOString(),
          attendeeName: formData.name, attendeeEmail: formData.email, attendeePhone: formData.phone || undefined,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          gclid: trackingParams.gclid,
        }),
      })
      if (response.ok) setConfirmed(true)
      else alert((await response.json()).message || 'Booking failed')
    } finally { setSubmitting(false) }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear(), month = date.getMonth()
    return { daysInMonth: new Date(year, month + 1, 0).getDate(), startingDayOfWeek: new Date(year, month, 1).getDay() }
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth)
  const today = new Date(); today.setHours(0, 0, 0, 0)

  if (confirmed) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">✓</span>
          </div>
          <h2 className="text-3xl font-light mb-4">Gebucht</h2>
          <p className="text-gray-600">{selectedDate?.toLocaleDateString('de-DE')} um {selectedTime} Uhr</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light mb-2">{eventType.title}</h1>
          <p className="text-gray-600">{eventType.duration} Min</p>
        </div>

        <div className="border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
              <ChevronLeft />
            </button>
            <span className="font-light">{currentMonth.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}</span>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
              <ChevronRight />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['S', 'M', 'D', 'M', 'D', 'F', 'S'].map(d => <div key={d} className="text-center text-gray-400 text-sm py-2">{d}</div>)}
            {Array.from({ length: startingDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
              const isPast = date < today
              const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentMonth.getMonth()
              return (
                <button key={day} onClick={() => !isPast && setSelectedDate(date)} disabled={isPast}
                  className={`aspect-square border ${isPast ? 'border-gray-100 text-gray-300' : isSelected ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-black'}`}>
                  {day}
                </button>
              )
            })}
          </div>
        </div>

        {selectedDate && (
          <div className="space-y-6">
            {loadingSlots ? <div className="text-center py-8">Lädt...</div> : availableSlots.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {availableSlots.map(slot => (
                  <button key={slot} onClick={() => setSelectedTime(slot)}
                    className={`py-3 border ${selectedTime === slot ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-black'}`}>
                    {slot}
                  </button>
                ))}
              </div>
            ) : <p className="text-center text-gray-500">Keine Zeiten</p>}

            {selectedTime && (
              <div className="space-y-4 pt-6 border-t">
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Name" className="border-gray-300" />
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="E-Mail" className="border-gray-300" />
                <Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Telefon (optional)" className="border-gray-300" />
                <Button onClick={handleSubmit} disabled={submitting || !formData.name || !formData.email}
                  className="w-full bg-black hover:bg-gray-800 py-6">
                  {submitting ? 'Buchen...' : 'Buchen'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
