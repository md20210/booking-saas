"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

interface IntegrationsClientProps {
  googleIntegration: {
    id: string
    active: boolean
    calendarId: string
    createdAt: Date
  } | null
  outlookIntegration: {
    id: string
    active: boolean
    calendarId: string
    calendarName: string | null
    email: string | null
    displayName: string | null
    createdAt: Date
  } | null
}

export function IntegrationsClient({
  googleIntegration,
  outlookIntegration,
}: IntegrationsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [disconnecting, setDisconnecting] = useState<'google' | 'outlook' | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Handle URL params for success/error messages
  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (success === 'outlook_connected') {
      setMessage({ type: 'success', text: 'Outlook Calendar connected successfully!' })
      // Clear URL params
      router.replace('/integrations')
    } else if (error) {
      const errorMessages: Record<string, string> = {
        outlook_denied: 'Outlook access was denied',
        invalid_callback: 'Invalid OAuth callback',
        misconfigured: 'Outlook integration is not properly configured',
        token_exchange_failed: 'Failed to exchange authorization code',
        callback_failed: 'OAuth callback failed',
      }
      setMessage({
        type: 'error',
        text: errorMessages[error] || 'An error occurred',
      })
      router.replace('/integrations')
    }
  }, [searchParams, router])

  const handleGoogleConnect = () => {
    window.location.href = '/api/integrations/google/auth'
  }

  const handleGoogleDisconnect = async () => {
    setDisconnecting('google')
    setMessage(null)

    try {
      const response = await fetch('/api/integrations/google/disconnect', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to disconnect')
      }

      setMessage({ type: 'success', text: 'Google Calendar disconnected' })
      router.refresh()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to disconnect Google Calendar' })
    } finally {
      setDisconnecting(null)
    }
  }

  const handleOutlookConnect = () => {
    window.location.href = '/api/integrations/outlook/auth'
  }

  const handleOutlookDisconnect = async () => {
    setDisconnecting('outlook')
    setMessage(null)

    try {
      const response = await fetch('/api/integrations/outlook/disconnect', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to disconnect')
      }

      setMessage({ type: 'success', text: 'Outlook Calendar disconnected' })
      router.refresh()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to disconnect Outlook Calendar' })
    } finally {
      setDisconnecting(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Status Message */}
      {message && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Google Calendar Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                Google Calendar
                {googleIntegration?.active && (
                  <CheckCircle2 className="text-green-600" size={20} />
                )}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Sync your bookings with Google Calendar and create Google Meet links
              </p>
              {googleIntegration?.active && (
                <div className="mt-3 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Status:</span>{' '}
                    <span className="text-green-600">Connected</span>
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Calendar:</span> {googleIntegration.calendarId}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Connected:</span>{' '}
                    {new Date(googleIntegration.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div>
            {googleIntegration?.active ? (
              <Button
                onClick={handleGoogleDisconnect}
                disabled={disconnecting === 'google'}
                variant="outline"
                size="sm"
              >
                {disconnecting === 'google' && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Disconnect
              </Button>
            ) : (
              <Button onClick={handleGoogleConnect} size="sm">
                Connect
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Outlook Calendar Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="text-indigo-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                Microsoft Outlook
                {outlookIntegration?.active && (
                  <CheckCircle2 className="text-green-600" size={20} />
                )}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Sync with Outlook Calendar and create Microsoft Teams meetings
              </p>
              {outlookIntegration?.active && (
                <div className="mt-3 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Status:</span>{' '}
                    <span className="text-green-600">Connected</span>
                  </p>
                  {outlookIntegration.displayName && (
                    <p className="text-gray-600">
                      <span className="font-medium">Account:</span>{' '}
                      {outlookIntegration.displayName}
                    </p>
                  )}
                  {outlookIntegration.email && (
                    <p className="text-gray-600">
                      <span className="font-medium">Email:</span> {outlookIntegration.email}
                    </p>
                  )}
                  <p className="text-gray-600">
                    <span className="font-medium">Calendar:</span>{' '}
                    {outlookIntegration.calendarName || outlookIntegration.calendarId}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Connected:</span>{' '}
                    {new Date(outlookIntegration.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div>
            {outlookIntegration?.active ? (
              <Button
                onClick={handleOutlookDisconnect}
                disabled={disconnecting === 'outlook'}
                variant="outline"
                size="sm"
              >
                {disconnecting === 'outlook' && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Disconnect
              </Button>
            ) : (
              <Button onClick={handleOutlookConnect} size="sm">
                Connect
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <span>📘</span> About Calendar Integrations
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>
              Connect <strong>Google Calendar</strong> to automatically create calendar events and
              Google Meet links for your bookings
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>
              Connect <strong>Microsoft Outlook</strong> to sync with Office 365 Calendar and
              create Teams meetings
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>You can connect both calendars simultaneously for maximum flexibility</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>
              Your calendar credentials are encrypted and stored securely. They are only used to
              create events for confirmed bookings.
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}
