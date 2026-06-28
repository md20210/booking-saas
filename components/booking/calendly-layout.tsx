"use client"

import { useState } from "react"
import { Calendar, Clock, Check, User, Mail, Phone, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CalendlyLayoutProps {
  eventType: {
    id: string
    title: string
    description?: string
    duration: number
    user: {
      name: string
      image?: string
    }
  }
  design?: {
    primaryColor: string
    logo?: string
    fontFamily: string
  }
  onBooking?: (data: any) => void
}

export function CalendlyLayout({
  eventType,
  design = {
    primaryColor: "#006BFF",
    fontFamily: "Inter, sans-serif"
  },
  onBooking
}: CalendlyLayoutProps) {
  const [step, setStep] = useState<"date" | "time" | "details" | "confirmed">("date")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: ""
  })

  // Generate calendar days for current month
  const generateCalendar = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      // Only future dates
      if (date >= new Date(today.setHours(0, 0, 0, 0))) {
        days.push(date)
      } else {
        days.push(null)
      }
    }

    return days
  }

  // Mock time slots (in production, fetch from API)
  const availableTimeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "01:00 PM", "01:30 PM",
    "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM"
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const bookingData = {
      eventTypeId: eventType.id,
      date: selectedDate,
      time: selectedTime,
      ...formData
    }

    onBooking?.(bookingData)
    setStep("confirmed")
  }

  const formatDate = (date: Date | null) => {
    if (!date) return ""
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  return (
    <div
      className="calendly-layout"
      style={{
        fontFamily: design.fontFamily,
        "--primary-color": design.primaryColor,
      } as React.CSSProperties}
    >
      <style jsx>{`
        .calendly-layout {
          display: flex;
          min-height: 600px;
          max-width: 1000px;
          margin: 0 auto;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }

        .sidebar {
          width: 320px;
          background: white;
          border-right: 1px solid #e5e7eb;
          padding: 40px 32px;
          display: flex;
          flex-direction: column;
        }

        .logo {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          margin-bottom: 24px;
          object-fit: cover;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          font-weight: 600;
        }

        .event-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 16px;
          line-height: 1.3;
        }

        .event-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 24px;
        }

        .event-description {
          color: #4b5563;
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .selected-slot {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          margin-top: auto;
        }

        .selected-slot-label {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 8px;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .selected-slot-value {
          font-size: 14px;
          color: #111827;
          font-weight: 500;
        }

        .main-content {
          flex: 1;
          padding: 40px 48px;
          background: #fafbfc;
          overflow-y: auto;
        }

        .step-header {
          margin-bottom: 32px;
        }

        .step-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 8px;
        }

        .step-subtitle {
          font-size: 14px;
          color: #6b7280;
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--primary-color);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          margin-bottom: 24px;
          background: none;
          border: none;
          padding: 0;
        }

        .back-button:hover {
          opacity: 0.8;
        }

        /* Calendar Styles */
        .calendar-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
          margin-bottom: 8px;
        }

        .calendar-day-name {
          text-align: center;
          font-size: 13px;
          font-weight: 600;
          color: #6b7280;
          padding: 8px 0;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
        }

        .calendar-day {
          aspect-ratio: 1;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .calendar-day:not(:disabled):hover {
          border-color: var(--primary-color);
          background: #f0f7ff;
        }

        .calendar-day.selected {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .calendar-day:disabled {
          cursor: not-allowed;
          color: #d1d5db;
          background: #f9fafb;
        }

        /* Time Slots */
        .time-slots {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 12px;
          max-height: 400px;
          overflow-y: auto;
        }

        .time-slot {
          padding: 12px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: white;
          text-align: center;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .time-slot:hover {
          border-color: var(--primary-color);
          background: #f0f7ff;
          color: var(--primary-color);
        }

        .time-slot.selected {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        /* Form */
        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }

        .form-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.15s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(0, 107, 255, 0.1);
        }

        .form-textarea {
          min-height: 100px;
          resize: vertical;
        }

        .submit-button {
          width: 100%;
          padding: 14px 24px;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .submit-button:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* Confirmation */
        .confirmation {
          text-align: center;
          padding: 60px 40px;
        }

        .success-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #10b981;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }

        .confirmation-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 12px;
        }

        .confirmation-subtitle {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 32px;
        }

        .booking-details {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 24px;
          text-align: left;
          max-width: 400px;
          margin: 0 auto;
        }

        .detail-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-icon {
          color: #6b7280;
        }

        .detail-text {
          font-size: 14px;
          color: #111827;
        }

        @media (max-width: 768px) {
          .calendly-layout {
            flex-direction: column;
          }

          .sidebar {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid #e5e7eb;
            padding: 24px 20px;
          }

          .main-content {
            padding: 24px 20px;
          }

          .time-slots {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Sidebar */}
      <div className="sidebar">
        {design.logo && (
          <img src={design.logo} alt="Logo" className="logo" />
        )}

        <div className="user-info">
          <div className="avatar">
            {eventType.user.image ? (
              <img src={eventType.user.image} alt={eventType.user.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
            ) : (
              eventType.user.name.charAt(0).toUpperCase()
            )}
          </div>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>{eventType.user.name}</span>
        </div>

        <h1 className="event-title">{eventType.title}</h1>

        <div className="event-meta">
          <Clock size={16} />
          <span>{eventType.duration} min</span>
        </div>

        {eventType.description && (
          <p className="event-description">{eventType.description}</p>
        )}

        {selectedDate && selectedTime && (
          <div className="selected-slot">
            <div className="selected-slot-label">Selected Time</div>
            <div className="selected-slot-value">
              {formatDate(selectedDate)}
            </div>
            <div className="selected-slot-value" style={{ marginTop: '4px' }}>
              {selectedTime}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Date Selection */}
        {step === "date" && (
          <div>
            <div className="step-header">
              <h2 className="step-title">Select a Date</h2>
              <p className="step-subtitle">Click on a date to see available times</p>
            </div>

            <div className="calendar-header">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="calendar-day-name">{day}</div>
              ))}
            </div>

            <div className="calendar-grid">
              {generateCalendar().map((date, index) => (
                <button
                  key={index}
                  className={`calendar-day ${selectedDate && date && date.toDateString() === selectedDate.toDateString() ? "selected" : ""}`}
                  disabled={!date}
                  onClick={() => {
                    if (date) {
                      setSelectedDate(date)
                      setStep("time")
                    }
                  }}
                >
                  {date && date.getDate()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Time Selection */}
        {step === "time" && (
          <div>
            <button className="back-button" onClick={() => setStep("date")}>
              <ChevronLeft size={16} />
              Back to date
            </button>

            <div className="step-header">
              <h2 className="step-title">{formatDate(selectedDate)}</h2>
              <p className="step-subtitle">Select a time</p>
            </div>

            <div className="time-slots">
              {availableTimeSlots.map((time) => (
                <button
                  key={time}
                  className={`time-slot ${selectedTime === time ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedTime(time)
                    setStep("details")
                  }}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Details Form */}
        {step === "details" && (
          <div>
            <button className="back-button" onClick={() => setStep("time")}>
              <ChevronLeft size={16} />
              Back to times
            </button>

            <div className="step-header">
              <h2 className="step-title">Enter Details</h2>
              <p className="step-subtitle">Fill in your information</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="you@example.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone (Optional)</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Additional Notes (Optional)</label>
                <textarea
                  className="form-input form-textarea"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Please share anything that will help prepare for our meeting."
                />
              </div>

              <button type="submit" className="submit-button">
                Schedule Event
              </button>
            </form>
          </div>
        )}

        {/* Confirmation */}
        {step === "confirmed" && (
          <div className="confirmation">
            <div className="success-icon">
              <Check size={32} strokeWidth={3} />
            </div>

            <h2 className="confirmation-title">You are scheduled</h2>
            <p className="confirmation-subtitle">
              A calendar invitation has been sent to your email address.
            </p>

            <div className="booking-details">
              <div className="detail-row">
                <Calendar size={20} className="detail-icon" />
                <span className="detail-text">{formatDate(selectedDate)}</span>
              </div>
              <div className="detail-row">
                <Clock size={20} className="detail-icon" />
                <span className="detail-text">{selectedTime} ({eventType.duration} min)</span>
              </div>
              <div className="detail-row">
                <User size={20} className="detail-icon" />
                <span className="detail-text">{formData.name}</span>
              </div>
              <div className="detail-row">
                <Mail size={20} className="detail-icon" />
                <span className="detail-text">{formData.email}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
