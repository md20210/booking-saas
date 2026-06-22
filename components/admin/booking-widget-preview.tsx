'use client'

import React from 'react'
import { Calendar, Clock, User, ChevronRight } from 'lucide-react'

export interface DesignSettings {
  primaryColor: string
  backgroundColor: string
  textColor: string
  borderColor: string
  fontFamily: string
  headingFontSize: string
  bodyFontSize: string
  buttonFontSize: string
  widgetWidth: string
  widgetHeight: string
  layoutVariant: 'calendar-left' | 'calendar-right' | 'compact' | 'slots-only'
  logoUrl?: string | null
  showBranding: boolean
  customCss?: string | null
}

interface BookingWidgetPreviewProps {
  settings: DesignSettings
}

export function BookingWidgetPreview({ settings }: BookingWidgetPreviewProps) {
  // Sample data for preview
  const sampleSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
  ]

  const today = new Date()
  const monthYear = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // CSS variables for dynamic styling
  const cssVariables = {
    '--primary-color': settings.primaryColor,
    '--background-color': settings.backgroundColor,
    '--text-color': settings.textColor,
    '--border-color': settings.borderColor,
    '--font-family': settings.fontFamily,
    '--heading-font-size': settings.headingFontSize,
    '--body-font-size': settings.bodyFontSize,
    '--button-font-size': settings.buttonFontSize,
    '--widget-width': settings.widgetWidth,
    '--widget-height': settings.widgetHeight,
  } as React.CSSProperties

  const renderCalendarLeft = () => (
    <div className="flex gap-6">
      {/* Calendar Section */}
      <div className="flex-1 min-w-[300px]">
        <div className="text-center mb-4">
          <h3 className="font-semibold" style={{ fontSize: 'var(--heading-font-size)', color: 'var(--text-color)' }}>
            {monthYear}
          </h3>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-xs font-medium py-2" style={{ color: 'var(--text-color)', opacity: 0.6 }}>
              {day}
            </div>
          ))}
          {Array.from({ length: 35 }, (_, i) => {
            const day = i - 2
            const isToday = day === today.getDate()
            const isCurrentMonth = day > 0 && day <= 31
            return (
              <div
                key={i}
                className="aspect-square flex items-center justify-center rounded-lg cursor-pointer transition-colors"
                style={{
                  backgroundColor: isToday ? 'var(--primary-color)' : 'transparent',
                  color: isToday ? '#ffffff' : isCurrentMonth ? 'var(--text-color)' : 'var(--border-color)',
                  border: `1px solid var(--border-color)`,
                  fontSize: 'var(--body-font-size)',
                }}
              >
                {isCurrentMonth ? day : ''}
              </div>
            )
          })}
        </div>
      </div>

      {/* Time Slots Section */}
      <div className="flex-1 min-w-[250px]">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={20} style={{ color: 'var(--primary-color)' }} />
          <h3 className="font-semibold" style={{ fontSize: 'var(--heading-font-size)', color: 'var(--text-color)' }}>
            Available Times
          </h3>
        </div>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {sampleSlots.map((slot) => (
            <button
              key={slot}
              className="w-full py-3 px-4 rounded-lg transition-all hover:shadow-md"
              style={{
                backgroundColor: 'var(--background-color)',
                color: 'var(--text-color)',
                border: `2px solid var(--border-color)`,
                fontSize: 'var(--button-font-size)',
                fontFamily: 'var(--font-family)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = settings.primaryColor
                e.currentTarget.style.backgroundColor = settings.primaryColor + '10'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = settings.borderColor
                e.currentTarget.style.backgroundColor = settings.backgroundColor
              }}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderCalendarRight = () => (
    <div className="flex gap-6">
      {/* Time Slots Section */}
      <div className="flex-1 min-w-[250px]">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={20} style={{ color: 'var(--primary-color)' }} />
          <h3 className="font-semibold" style={{ fontSize: 'var(--heading-font-size)', color: 'var(--text-color)' }}>
            Available Times
          </h3>
        </div>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {sampleSlots.map((slot) => (
            <button
              key={slot}
              className="w-full py-3 px-4 rounded-lg transition-all hover:shadow-md"
              style={{
                backgroundColor: 'var(--background-color)',
                color: 'var(--text-color)',
                border: `2px solid var(--border-color)`,
                fontSize: 'var(--button-font-size)',
                fontFamily: 'var(--font-family)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = settings.primaryColor
                e.currentTarget.style.backgroundColor = settings.primaryColor + '10'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = settings.borderColor
                e.currentTarget.style.backgroundColor = settings.backgroundColor
              }}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Section */}
      <div className="flex-1 min-w-[300px]">
        <div className="text-center mb-4">
          <h3 className="font-semibold" style={{ fontSize: 'var(--heading-font-size)', color: 'var(--text-color)' }}>
            {monthYear}
          </h3>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-xs font-medium py-2" style={{ color: 'var(--text-color)', opacity: 0.6 }}>
              {day}
            </div>
          ))}
          {Array.from({ length: 35 }, (_, i) => {
            const day = i - 2
            const isToday = day === today.getDate()
            const isCurrentMonth = day > 0 && day <= 31
            return (
              <div
                key={i}
                className="aspect-square flex items-center justify-center rounded-lg cursor-pointer transition-colors"
                style={{
                  backgroundColor: isToday ? 'var(--primary-color)' : 'transparent',
                  color: isToday ? '#ffffff' : isCurrentMonth ? 'var(--text-color)' : 'var(--border-color)',
                  border: `1px solid var(--border-color)`,
                  fontSize: 'var(--body-font-size)',
                }}
              >
                {isCurrentMonth ? day : ''}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  const renderCompact = () => (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={20} style={{ color: 'var(--primary-color)' }} />
        <h3 className="font-semibold" style={{ fontSize: 'var(--heading-font-size)', color: 'var(--text-color)' }}>
          Select Date & Time
        </h3>
      </div>
      <div className="space-y-4">
        <div
          className="p-4 rounded-lg cursor-pointer"
          style={{
            border: `2px solid var(--border-color)`,
            backgroundColor: 'var(--background-color)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar size={18} style={{ color: 'var(--primary-color)' }} />
              <span style={{ color: 'var(--text-color)', fontSize: 'var(--body-font-size)' }}>
                {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <ChevronRight size={18} style={{ color: 'var(--text-color)' }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {sampleSlots.slice(0, 4).map((slot) => (
            <button
              key={slot}
              className="py-2 px-3 rounded-lg transition-all"
              style={{
                backgroundColor: 'var(--background-color)',
                color: 'var(--text-color)',
                border: `2px solid var(--border-color)`,
                fontSize: 'var(--button-font-size)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = settings.primaryColor
                e.currentTarget.style.backgroundColor = settings.primaryColor + '10'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = settings.borderColor
                e.currentTarget.style.backgroundColor = settings.backgroundColor
              }}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSlotsOnly = () => (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={20} style={{ color: 'var(--primary-color)' }} />
        <h3 className="font-semibold" style={{ fontSize: 'var(--heading-font-size)', color: 'var(--text-color)' }}>
          Available Times
        </h3>
      </div>
      <div className="space-y-2">
        {sampleSlots.map((slot) => (
          <button
            key={slot}
            className="w-full py-3 px-4 rounded-lg transition-all hover:shadow-md"
            style={{
              backgroundColor: 'var(--background-color)',
              color: 'var(--text-color)',
              border: `2px solid var(--border-color)`,
              fontSize: 'var(--button-font-size)',
              fontFamily: 'var(--font-family)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = settings.primaryColor
              e.currentTarget.style.backgroundColor = settings.primaryColor + '10'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = settings.borderColor
              e.currentTarget.style.backgroundColor = settings.backgroundColor
            }}
          >
            {slot}
          </button>
        ))}
      </div>
    </div>
  )

  const renderLayout = () => {
    switch (settings.layoutVariant) {
      case 'calendar-left':
        return renderCalendarLeft()
      case 'calendar-right':
        return renderCalendarRight()
      case 'compact':
        return renderCompact()
      case 'slots-only':
        return renderSlotsOnly()
      default:
        return renderCalendarLeft()
    }
  }

  return (
    <div
      className="w-full h-full overflow-auto p-6"
      style={{
        backgroundColor: '#f3f4f6',
        fontFamily: 'var(--font-family)',
      }}
    >
      <div
        className="mx-auto rounded-xl shadow-xl p-6"
        style={{
          maxWidth: 'var(--widget-width)',
          height: 'var(--widget-height)',
          backgroundColor: 'var(--background-color)',
          ...cssVariables,
        }}
      >
        {/* Header */}
        <div className="mb-6">
          {settings.logoUrl && (
            <div className="mb-4">
              <img
                src={settings.logoUrl}
                alt="Logo"
                className="h-10 object-contain"
              />
            </div>
          )}
          <h2 className="font-bold mb-2" style={{ fontSize: 'calc(var(--heading-font-size) * 1.2)', color: 'var(--text-color)' }}>
            Book a Meeting
          </h2>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-color)', opacity: 0.7 }}>
            <Clock size={16} />
            <span>30 minutes</span>
          </div>
        </div>

        {/* Layout */}
        {renderLayout()}

        {/* Footer */}
        {settings.showBranding && (
          <div className="mt-6 pt-4 text-center text-xs" style={{ borderTop: `1px solid var(--border-color)`, color: 'var(--text-color)', opacity: 0.5 }}>
            Powered by BookingSaaS
          </div>
        )}

        {/* Custom CSS */}
        {settings.customCss && (
          <style>{settings.customCss}</style>
        )}
      </div>
    </div>
  )
}
