"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react"

interface EventType { id: string; title: string; description: string | null; duration: number; slug: string }
export function VibrantLayout({ eventType }: { eventType: EventType }) {
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
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-orange-400 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-lg w-full text-center transform rotate-1">
          <Sparkles size={64} className="mx-auto mb-6 text-yellow-400" />
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-orange-600 mb-4">Yay! Gebucht!</h2>
          <p className="text-gray-700 text-lg">Check deine E-Mails für alle Details! 🎉</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-orange-400 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 transform -rotate-1">
          <div className="transform rotate-1">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-orange-600 mb-4">{eventType.title}</h1>
            {eventType.description && <p className="text-gray-700 text-lg mb-4">{eventType.description}</p>}
            <div className="inline-block bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-2 rounded-full font-bold">
              {eventType.duration} Min
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <div className="transform rotate-1">
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 bg-pink-100 rounded-full">
                  <ChevronLeft className="text-pink-600" />
                </button>
                <span className="font-bold text-purple-600">{currentMonth.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 bg-pink-100 rounded-full">
                  <ChevronRight className="text-pink-600" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-center text-sm font-bold text-purple-600 py-2">{d}</div>)}
                {Array.from({ length: startingDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                  const isPast = date < today
                  const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentMonth.getMonth()
                  return (
                    <button key={day} onClick={() => !isPast && setSelectedDate(date)} disabled={isPast}
                      className={`aspect-square rounded-xl font-bold ${isPast ? 'text-gray-300' : isSelected ? 'bg-gradient-to-br from-pink-500 to-orange-500 text-white shadow-lg' : 'bg-gradient-to-br from-pink-100 to-orange-100 text-purple-700 hover:shadow-md'}`}>
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              {selectedDate && (
                <>
                  {loadingSlots ? <div className="text-center py-8">⏳</div> : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {availableSlots.map(slot => (
                        <button key={slot} onClick={() => setSelectedTime(slot)}
                          className={`py-4 rounded-2xl font-bold ${selectedTime === slot ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-lg' : 'bg-gradient-to-r from-pink-100 to-orange-100 text-purple-700 hover:shadow-md'}`}>
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : <p>😢 Keine Zeiten</p>}

                  {selectedTime && (
                    <div className="space-y-4">
                      <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Dein Name" className="border-2 border-pink-300 rounded-xl" />
                      <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="E-Mail" className="border-2 border-pink-300 rounded-xl" />
                      <Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Telefon" className="border-2 border-pink-300 rounded-xl" />
                      <Button onClick={handleSubmit} disabled={submitting || !formData.name || !formData.email}
                        className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 hover:from-pink-600 hover:via-purple-600 hover:to-orange-600 text-white py-6 rounded-2xl font-black text-lg shadow-lg">
                        {submitting ? '⏳ Buchen...' : '✨ Jetzt buchen!'}
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
