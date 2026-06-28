"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Building2 } from "lucide-react"

interface EventType { id: string; title: string; description: string | null; duration: number; slug: string }
export function CorporateLayout({ eventType }: { eventType: EventType }) {
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
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, gclid: trackingParams.gclid,
        }),
      })
      if (response.ok) setConfirmed(true)
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
      <div className="min-h-screen bg-blue-900 flex items-center justify-center p-4">
        <div className="bg-white rounded p-12 max-w-lg w-full text-center shadow-2xl">
          <Building2 size={48} className="mx-auto mb-4 text-blue-900" />
          <h2 className="text-3xl font-bold text-blue-900 mb-2">Termin bestätigt</h2>
          <p className="text-gray-700">Wir haben Ihre Buchung erhalten und senden Ihnen eine Bestätigung per E-Mail.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow-2xl p-12">
          <div className="border-l-4 border-blue-900 pl-6 mb-8">
            <h1 className="text-4xl font-bold text-blue-900 mb-2">{eventType.title}</h1>
            {eventType.description && <p className="text-gray-600">{eventType.description}</p>}
            <p className="text-gray-500 mt-2">Dauer: {eventType.duration} Minuten</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center justify-between mb-6 bg-blue-50 p-4">
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
                  <ChevronLeft className="text-blue-900" />
                </button>
                <span className="font-bold text-blue-900">{currentMonth.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
                  <ChevronRight className="text-blue-900" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].map(d => <div key={d} className="text-center text-sm font-bold text-gray-600 py-2">{d}</div>)}
                {Array.from({ length: startingDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                  const isPast = date < today
                  const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentMonth.getMonth()
                  return (
                    <button key={day} onClick={() => !isPast && setSelectedDate(date)} disabled={isPast}
                      className={`aspect-square font-semibold ${isPast ? 'text-gray-300' : isSelected ? 'bg-blue-900 text-white' : 'bg-blue-50 text-blue-900 hover:bg-blue-100'}`}>
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              {selectedDate && (
                <>
                  <h3 className="font-bold text-blue-900 mb-4 text-lg">Verfügbare Termine</h3>
                  {loadingSlots ? <div className="text-center py-8">Laden...</div> : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 mb-6">
                      {availableSlots.map(slot => (
                        <button key={slot} onClick={() => setSelectedTime(slot)}
                          className={`py-3 font-semibold ${selectedTime === slot ? 'bg-blue-900 text-white' : 'bg-blue-50 text-blue-900 hover:bg-blue-100'}`}>
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : <p>Keine Termine</p>}

                  {selectedTime && (
                    <div className="space-y-4 pt-6 border-t-2 border-blue-100">
                      <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Name *" />
                      <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="E-Mail *" />
                      <Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Telefon" />
                      <Button onClick={handleSubmit} disabled={submitting || !formData.name || !formData.email}
                        className="w-full bg-blue-900 hover:bg-blue-800 py-6 font-bold">
                        {submitting ? 'Wird gebucht...' : 'Termin verbindlich buchen'}
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
