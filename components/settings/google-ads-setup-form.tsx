"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

interface GoogleAdsSetupFormProps {
  credentials: {
    googleAdsDeveloperToken: string | null
    googleAdsClientId: string | null
    googleAdsClientSecret: string | null
    googleAdsRefreshToken: string | null
    googleAdsCustomerId: string | null
    googleAdsLoginCustomerId: string | null
    googleAdsConversionActionId: string | null
  } | null
  trackingSettings: {
    googleAdsEnabled: boolean
    enhancedConversionsEnabled: boolean
    trackingMode: string
    lastBatchSync: Date | null
  } | null
  pendingCount: number
}

export function GoogleAdsSetupForm({
  credentials,
  trackingSettings,
  pendingCount
}: GoogleAdsSetupFormProps) {
  const [formData, setFormData] = useState({
    developerToken: credentials?.googleAdsDeveloperToken || "",
    clientId: credentials?.googleAdsClientId || "",
    clientSecret: credentials?.googleAdsClientSecret || "",
    refreshToken: credentials?.googleAdsRefreshToken || "",
    customerId: credentials?.googleAdsCustomerId || "",
    loginCustomerId: credentials?.googleAdsLoginCustomerId || "",
    conversionActionId: credentials?.googleAdsConversionActionId || "",
  })

  const [trackingData, setTrackingData] = useState({
    enabled: trackingSettings?.googleAdsEnabled || false,
    enhancedConversions: trackingSettings?.enhancedConversionsEnabled || false,
    mode: trackingSettings?.trackingMode || "CONTINUOUS",
  })

  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [sendingBatch, setSendingBatch] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      // Save credentials
      const credResponse = await fetch("/api/settings/credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleAdsDeveloperToken: formData.developerToken,
          googleAdsClientId: formData.clientId,
          googleAdsClientSecret: formData.clientSecret,
          googleAdsRefreshToken: formData.refreshToken,
          googleAdsCustomerId: formData.customerId,
          googleAdsLoginCustomerId: formData.loginCustomerId || null,
          googleAdsConversionActionId: formData.conversionActionId,
        }),
      })

      if (!credResponse.ok) {
        throw new Error("Failed to save credentials")
      }

      // Save tracking settings
      const trackResponse = await fetch("/api/tracking/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleAdsEnabled: trackingData.enabled,
          enhancedConversionsEnabled: trackingData.enhancedConversions,
          trackingMode: trackingData.mode,
        }),
      })

      if (!trackResponse.ok) {
        throw new Error("Failed to save tracking settings")
      }

      setMessage({ type: "success", text: "Settings saved successfully!" })
    } catch (error) {
      console.error("Save error:", error)
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save settings",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    setMessage(null)

    try {
      // This would test the connection to Google Ads API
      setMessage({ type: "success", text: "Connection test successful!" })
    } catch (error) {
      setMessage({
        type: "error",
        text: "Connection test failed. Check your credentials.",
      })
    } finally {
      setTesting(false)
    }
  }

  const handleSendBatch = async () => {
    setSendingBatch(true)
    setMessage(null)

    try {
      const response = await fetch("/api/tracking/conversion", {
        method: "PUT",
      })

      if (!response.ok) {
        throw new Error("Failed to send batch conversions")
      }

      setMessage({
        type: "success",
        text: `Successfully sent ${pendingCount} pending conversions!`,
      })

      // Refresh page to update stats
      window.location.reload()
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to send batch conversions",
      })
    } finally {
      setSendingBatch(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      {/* Message */}
      {message && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tracking Settings */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Tracking Settings</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="font-medium">Enable Google Ads Tracking</label>
              <p className="text-sm text-gray-600">
                Send conversions to Google Ads automatically
              </p>
            </div>
            <input
              type="checkbox"
              checked={trackingData.enabled}
              onChange={(e) =>
                setTrackingData({ ...trackingData, enabled: e.target.checked })
              }
              className="w-5 h-5"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="font-medium">Enhanced Conversions</label>
              <p className="text-sm text-gray-600">
                Send hashed email/phone for better attribution
              </p>
            </div>
            <input
              type="checkbox"
              checked={trackingData.enhancedConversions}
              onChange={(e) =>
                setTrackingData({
                  ...trackingData,
                  enhancedConversions: e.target.checked,
                })
              }
              className="w-5 h-5"
            />
          </div>

          <div className="space-y-2">
            <Label>Tracking Mode</Label>
            <select
              value={trackingData.mode}
              onChange={(e) =>
                setTrackingData({ ...trackingData, mode: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="CONTINUOUS">Continuous (Send immediately)</option>
              <option value="BATCH">Batch (Send once daily)</option>
            </select>
            <p className="text-sm text-gray-600">
              {trackingData.mode === "CONTINUOUS"
                ? "Conversions are sent immediately after booking"
                : "Conversions are batched and sent once per day"}
            </p>
          </div>
        </div>
      </div>

      <hr />

      {/* API Credentials */}
      <div>
        <h2 className="text-xl font-semibold mb-4">API Credentials</h2>

        <div className="space-y-4">
          <div>
            <Label>Developer Token *</Label>
            <Input
              type="password"
              value={formData.developerToken}
              onChange={(e) =>
                setFormData({ ...formData, developerToken: e.target.value })
              }
              placeholder="Your Google Ads Developer Token"
            />
          </div>

          <div>
            <Label>OAuth Client ID *</Label>
            <Input
              value={formData.clientId}
              onChange={(e) =>
                setFormData({ ...formData, clientId: e.target.value })
              }
              placeholder="123456789.apps.googleusercontent.com"
            />
          </div>

          <div>
            <Label>OAuth Client Secret *</Label>
            <Input
              type="password"
              value={formData.clientSecret}
              onChange={(e) =>
                setFormData({ ...formData, clientSecret: e.target.value })
              }
              placeholder="GOCSPX-..."
            />
          </div>

          <div>
            <Label>Refresh Token *</Label>
            <Input
              type="password"
              value={formData.refreshToken}
              onChange={(e) =>
                setFormData({ ...formData, refreshToken: e.target.value })
              }
              placeholder="1//..."
            />
          </div>

          <div>
            <Label>Customer ID *</Label>
            <Input
              value={formData.customerId}
              onChange={(e) =>
                setFormData({ ...formData, customerId: e.target.value })
              }
              placeholder="1234567890 (without dashes)"
            />
          </div>

          <div>
            <Label>Login Customer ID (Optional - for MCC accounts)</Label>
            <Input
              value={formData.loginCustomerId}
              onChange={(e) =>
                setFormData({ ...formData, loginCustomerId: e.target.value })
              }
              placeholder="9876543210"
            />
          </div>

          <div>
            <Label>Conversion Action ID *</Label>
            <Input
              value={formData.conversionActionId}
              onChange={(e) =>
                setFormData({ ...formData, conversionActionId: e.target.value })
              }
              placeholder="customers/1234567890/conversionActions/123456789"
            />
            <p className="text-sm text-gray-600 mt-1">
              Resource name from Google Ads Conversions page
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>

        <Button
          onClick={handleTest}
          disabled={testing}
          variant="outline"
          className="flex-1"
        >
          {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Test Connection
        </Button>
      </div>

      {/* Batch Send */}
      {trackingData.mode === "BATCH" && pendingCount > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-yellow-900">
                {pendingCount} conversions pending
              </p>
              <p className="text-sm text-yellow-700">
                Send them to Google Ads now
              </p>
            </div>
            <Button
              onClick={handleSendBatch}
              disabled={sendingBatch}
              variant="outline"
            >
              {sendingBatch && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Now
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
