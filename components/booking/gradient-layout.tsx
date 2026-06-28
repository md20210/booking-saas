"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface EventType { id: string; title: string; description: string | null; duration: number; slug: string }
export function GradientLayout({ eventType }: { eventType: EventType }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [trackingParams, setTrackingParams] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" })

  useEffect(() => { if (typeof window === 'undefined') return; const params = new URLSearchParams(window.location.search); const captured: typeof trackingParams = {}; if (params.get('gclid')) captured.gclid = params.get('gclid')!; setTrackingParams(captured) }, [])
  useEffect(() => { if (!selectedDate) return; const fetchSlots = async () => { setLoadingSlots(true); try { const response = await fetch(`/api/slots?eventTypeId=${eventType.id}&date=${selectedDate.toISOString().split('T')[0]}`); if (response.ok) setAvailableSlots((await response.json()).slots || []) } finally { setLoadingSlots(false) } }; fetchSlots() }, [selectedDate, eventType.id])

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) return; setSubmitting(true)
    try {
      const [hours, minutes] = selectedTime.split(':'); const startTime = new Date(selectedDate); startTime.setHours(parseInt(hours), parseInt(minutes), 0); const endTime = new Date(startTime); endTime.setMinutes(endTime.getMinutes() + eventType.duration)
      const response = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventTypeId: eventType.id, startTime: startTime.toISOString(), endTime: endTime.toISOString(), attendeeName: formData.name, attendeeEmail: formData.email, attendeePhone: formData.phone || undefined, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, gclid: trackingParams.gclid }) })
      if (response.ok) setConfirmed(true)
    } finally { setSubmitting(false) }
  }

  const getDaysInMonth = (date: Date) => { const year = date.getFullYear(), month = date.getMonth(); return { daysInMonth: new Date(year, month + 1, 0).getDate(), startingDayOfWeek: new Date(year, month, 1).getDay() } }
  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth); const today = new Date(); today.setHours(0, 0, 0, 0)

  if (confirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-12 max-w-lg w-full text-center shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-4xl mx-auto mb-6">✓</div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-4">Gebucht!</h2>
          <p className="text-gray-700">Bestätigung folgt per E-Mail</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">{eventType.title}</h1>
          {eventType.description && <p className="text-gray-700 mb-6">{eventType.description}</p>}

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 hover:bg-emerald-100 rounded-lg"><ChevronLeft className="text-emerald-600" /></button>
                <span className="font-bold text-teal-700">{currentMonth.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 hover:bg-emerald-100 rounded-lg"><ChevronRight className="text-emerald-600" /></button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {['S', 'M', 'D', 'M', 'D', 'F', 'S'].map(d => <div key={d} className="text-center text-sm font-semibold text-teal-600 py-2">{d}</div>)}
                {Array.from({ length: startingDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1; const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day); const isPast = date < today; const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentMonth.getMonth()
                  return (
                    <button key={day} onClick={() => !isPast && setSelectedDate(date)} disabled={isPast}
                      className={`aspect-square rounded-lg font-semibold ${isPast ? 'text-gray-300' : isSelected ? 'bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-lg' : 'bg-gradient-to-br from-emerald-50 to-cyan-50 text-teal-700 hover:shadow-md'}`}>
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              {selectedDate && (
                <>
                  {loadingSlots ? <div className="text-center py-8">Laden...</div> : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      {availableSlots.map(slot => (
                        <button key={slot} onClick={() => setSelectedTime(slot)}
                          className={`py-3 rounded-lg font-semibold ${selectedTime === slot ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg' : 'bg-gradient-to-r from-emerald-100 to-cyan-100 text-teal-700'}`}>
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : <p>Keine Zeiten</p>}

                  {selectedTime && (
                    <div className="space-y-4">
                      <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Name" className="border-emerald-300" />
                      <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="E-Mail" className="border-emerald-300" />
                      <Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Telefon" className="border-emerald-300" />
                      <Button onClick={handleSubmit} disabled={submitting || !formData.name || !formData.email}
                        className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white py-6 rounded-lg font-bold shadow-lg">
                        {submitting ? 'Buchen...' : 'Jetzt buchen'}
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
