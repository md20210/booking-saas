'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Bell, Mail, MessageSquare, Info } from 'lucide-react'

interface ReminderSettings {
  email1HourBefore: boolean
  email24HoursBefore: boolean
  email1WeekBefore: boolean
  sms1HourBefore: boolean
  sms24HoursBefore: boolean
}

export default function RemindersPage() {
  const [settings, setSettings] = useState<ReminderSettings>({
    email1HourBefore: true,
    email24HoursBefore: true,
    email1WeekBefore: false,
    sms1HourBefore: false,
    sms24HoursBefore: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings/reminders')
      if (res.ok) {
        const data = await res.json()
        if (data.settings) {
          setSettings(data.settings)
        }
      }
    } catch (error) {
      console.error('Failed to fetch reminder settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/settings/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Reminder settings saved successfully!' })
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || 'Failed to save settings' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: keyof ReminderSettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bell className="w-8 h-8" />
          Reminder Settings
        </h1>
        <p className="text-gray-600 mt-2">
          Configure automatic email and SMS reminders for your bookings
        </p>
      </div>

      {message && (
        <Alert className={message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 mt-6">
        {/* Email Reminders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Reminders
            </CardTitle>
            <CardDescription>
              Send email reminders to attendees before their bookings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email1Hour">1 Hour Before</Label>
                <p className="text-sm text-gray-500">Send reminder 1 hour before the booking</p>
              </div>
              <Switch
                id="email1Hour"
                checked={settings.email1HourBefore}
                onCheckedChange={(checked) => updateSetting('email1HourBefore', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email24Hours">24 Hours Before</Label>
                <p className="text-sm text-gray-500">Send reminder 1 day before the booking</p>
              </div>
              <Switch
                id="email24Hours"
                checked={settings.email24HoursBefore}
                onCheckedChange={(checked) => updateSetting('email24HoursBefore', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email1Week">1 Week Before</Label>
                <p className="text-sm text-gray-500">Send reminder 7 days before the booking</p>
              </div>
              <Switch
                id="email1Week"
                checked={settings.email1WeekBefore}
                onCheckedChange={(checked) => updateSetting('email1WeekBefore', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* SMS Reminders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              SMS Reminders
            </CardTitle>
            <CardDescription>
              Send SMS reminders to attendees who provided their phone number
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                SMS reminders require Twilio configuration. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in your environment variables.
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms1Hour">1 Hour Before</Label>
                <p className="text-sm text-gray-500">Send SMS 1 hour before the booking</p>
              </div>
              <Switch
                id="sms1Hour"
                checked={settings.sms1HourBefore}
                onCheckedChange={(checked) => updateSetting('sms1HourBefore', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms24Hours">24 Hours Before</Label>
                <p className="text-sm text-gray-500">Send SMS 1 day before the booking</p>
              </div>
              <Switch
                id="sms24Hours"
                checked={settings.sms24HoursBefore}
                onCheckedChange={(checked) => updateSetting('sms24HoursBefore', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How Reminders Work</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <ul className="space-y-2 text-gray-700">
              <li>
                <strong>Automatic Scheduling:</strong> When a booking is confirmed (after payment), reminders are automatically scheduled based on your settings.
              </li>
              <li>
                <strong>Email Service:</strong> Email reminders use Resend (configure RESEND_API_KEY in environment).
              </li>
              <li>
                <strong>SMS Service:</strong> SMS reminders use Twilio (configure Twilio credentials in environment).
              </li>
              <li>
                <strong>Meeting Links:</strong> Reminders automatically include Google Meet, Teams, or Zoom links if configured.
              </li>
              <li>
                <strong>Cron Processing:</strong> A cron job processes pending reminders every 5-15 minutes (set up /api/cron/process-reminders).
              </li>
            </ul>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Reminder Settings
        </Button>
      </div>
    </div>
  )
}
