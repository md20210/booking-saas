"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, Clock, User, Mail, Phone, CheckCircle2, Calendar as CalendarIcon } from "lucide-react"

interface EventType {
  id: string
  title: string
  description: string | null
  duration: number
  slug: string
}

interface ModernCardLayoutProps {
  eventType: EventType
}

type Step = "date" | "time" | "details" | "confirm"

export function ModernCardLayout({ eventType }: ModernCardLayoutProps) {
  const [currentStep, setCurrentStep] = useState<Step>("date")
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

    // Google Ads Click IDs
    if (params.get('gclid')) captured.gclid = params.get('gclid')!
    if (params.get('gbraid')) captured.gbraid = params.get('gbraid')!
    if (params.get('wbraid')) captured.wbraid = params.get('wbraid')!

    // UTM Parameters
    if (params.get('utm_source')) captured.utm_source = params.get('utm_source')!
    if (params.get('utm_medium')) captured.utm_medium = params.get('utm_medium')!
    if (params.get('utm_campaign')) captured.utm_campaign = params.get('utm_campaign')!
    if (params.get('utm_term')) captured.utm_term = params.get('utm_term')!
    if (params.get('utm_content')) captured.utm_content = params.get('utm_content')!

    setTrackingParams(captured)
  }, [])

  // Fetch available slots when date changes
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

  const handleDateSelect = (day: number) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    setSelectedDate(selected)
    setSelectedTime(null)
    setCurrentStep("time")
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
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

  const steps = [
    { id: "date", label: "Datum wählen", icon: CalendarIcon },
    { id: "time", label: "Zeit wählen", icon: Clock },
    { id: "details", label: "Deine Daten", icon: User },
    { id: "confirm", label: "Bestätigen", icon: CheckCircle2 },
  ]

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  if (confirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-lg w-full border border-white/20">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle2 className="text-white" size={40} />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Buchung bestätigt!
            </h2>
            <p className="text-gray-600 mb-6">
              Dein Termin wurde erfolgreich gebucht. Du erhältst eine Bestätigungs-E-Mail mit allen Details.
            </p>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 space-y-3 text-left">
              <div className="flex items-center gap-3">
                <CalendarIcon className="text-purple-600" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Datum</p>
                  <p className="font-semibold">{selectedDate?.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="text-purple-600" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Zeit</p>
                  <p className="font-semibold">{selectedTime} Uhr ({eventType.duration} Min.)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="text-purple-600" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold">{formData.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 mb-8 border border-white/20">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
            {eventType.title}
          </h1>
          {eventType.description && (
            <p className="text-gray-600">{eventType.description}</p>
          )}
          <div className="flex items-center gap-2 mt-4 text-purple-600">
            <Clock size={20} />
            <span className="font-semibold">{eventType.duration} Minuten</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index <= currentStepIndex
              const isCurrent = step.id === currentStep

              return (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                    isActive
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-110'
                      : 'bg-white/50 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-purple-200' : ''}`}>
                    <Icon size={24} />
                  </div>
                  <p className={`text-xs font-medium text-center ${isActive ? 'text-purple-600' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                </div>
              )
            })}
          </div>
          <div className="h-2 bg-white/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Date Selection */}
          {currentStep === "date" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Wähle ein Datum</h2>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="text-purple-600" />
                  </button>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {currentMonth.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <ChevronRight className="text-purple-600" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-center text-sm font-semibold text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
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
                        onClick={() => !isPast && handleDateSelect(day)}
                        disabled={isPast}
                        className={`
                          aspect-square rounded-xl font-medium transition-all
                          ${isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:scale-105'}
                          ${isSelected
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                            : 'bg-gradient-to-br from-white to-purple-50 text-gray-700 hover:shadow-md'
                          }
                        `}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Time Selection */}
          {currentStep === "time" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Wähle eine Zeit</h2>
                <button
                  onClick={() => setCurrentStep("date")}
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                >
                  <ChevronLeft size={20} />
                  Zurück
                </button>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Gewähltes Datum:</p>
                <p className="font-semibold text-gray-800">
                  {selectedDate?.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {loadingSlots ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600" />
                  <p className="text-gray-600 mt-4">Lade verfügbare Zeiten...</p>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {availableSlots.map(slot => (
                    <button
                      key={slot}
                      onClick={() => {
                        handleTimeSelect(slot)
                        setCurrentStep("details")
                      }}
                      className={`
                        py-4 px-6 rounded-xl font-semibold transition-all
                        ${selectedTime === slot
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                          : 'bg-gradient-to-br from-white to-purple-50 text-gray-700 hover:shadow-md hover:scale-105'
                        }
                      `}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">Keine verfügbaren Zeiten für dieses Datum.</p>
                </div>
              )}
            </div>
          )}

          {/* Details Form */}
          {currentStep === "details" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Deine Kontaktdaten</h2>
                <button
                  onClick={() => setCurrentStep("time")}
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                >
                  <ChevronLeft size={20} />
                  Zurück
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-gray-700 font-semibold flex items-center gap-2 mb-2">
                    <User size={18} className="text-purple-600" />
                    Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Max Mustermann"
                    className="border-2 border-purple-100 focus:border-purple-500 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-700 font-semibold flex items-center gap-2 mb-2">
                    <Mail size={18} className="text-purple-600" />
                    E-Mail *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="max@beispiel.de"
                    className="border-2 border-purple-100 focus:border-purple-500 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-700 font-semibold flex items-center gap-2 mb-2">
                    <Phone size={18} className="text-purple-600" />
                    Telefon (optional)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+49 123 456789"
                    className="border-2 border-purple-100 focus:border-purple-500 rounded-xl"
                  />
                </div>

                <Button
                  onClick={() => setCurrentStep("confirm")}
                  disabled={!formData.name || !formData.email}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 rounded-xl text-lg font-semibold shadow-lg"
                >
                  Weiter zur Bestätigung
                  <ChevronRight className="ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Confirmation */}
          {currentStep === "confirm" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Buchung bestätigen</h2>
                <button
                  onClick={() => setCurrentStep("details")}
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                >
                  <ChevronLeft size={20} />
                  Zurück
                </button>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <CalendarIcon className="text-purple-600 mt-1" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Datum & Zeit</p>
                    <p className="font-semibold text-gray-800">
                      {selectedDate?.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="font-semibold text-gray-800">
                      {selectedTime} Uhr ({eventType.duration} Minuten)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <User className="text-purple-600 mt-1" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Kontaktdaten</p>
                    <p className="font-semibold text-gray-800">{formData.name}</p>
                    <p className="text-gray-600">{formData.email}</p>
                    {formData.phone && <p className="text-gray-600">{formData.phone}</p>}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 rounded-xl text-lg font-semibold shadow-lg"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                    Wird gebucht...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2" />
                    Jetzt verbindlich buchen
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
