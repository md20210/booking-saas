"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Save, Eye, EyeOff } from "lucide-react"

interface ApiCredentials {
  googleOAuthClientId?: string
  googleOAuthClientSecret?: string
  googleAdsDeveloperToken?: string
  googleAdsClientId?: string
  googleAdsClientSecret?: string
  googleAdsRefreshToken?: string
  emailProvider?: string
  emailApiKey?: string
  emailFromAddress?: string
  emailFromName?: string
  smtpHost?: string
  smtpPort?: number
  smtpUser?: string
  smtpPassword?: string
  smtpSecure?: boolean
}

export default function ApiCredentialsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSecrets, setShowSecrets] = useState(false)
  const [credentials, setCredentials] = useState<ApiCredentials>({
    emailProvider: "resend",
    smtpSecure: true,
  })

  useEffect(() => {
    fetchCredentials()
  }, [])

  const fetchCredentials = async () => {
    try {
      const response = await fetch("/api/settings/credentials")
      if (response.ok) {
        const data = await response.json()
        setCredentials(data.credentials || {})
      }
    } catch (error) {
      console.error("Error fetching credentials:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/settings/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })

      if (response.ok) {
        alert("API Credentials saved successfully!")
      } else {
        const data = await response.json()
        alert(`Error: ${data.error || "Failed to save credentials"}`)
      }
    } catch (error) {
      console.error("Error saving credentials:", error)
      alert("Error saving credentials")
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof ApiCredentials, value: any) => {
    setCredentials((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">API Credentials</h1>
        <p className="text-gray-600 mt-2">
          Configure your API credentials for Google, Email, and other services.
          All credentials are encrypted and stored securely.
        </p>
      </div>

      <div className="space-y-6">
        {/* Google OAuth & Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Google OAuth & Calendar</CardTitle>
            <CardDescription>
              Required for Google Calendar integration and user login via Google.
              Get these from{" "}
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google Cloud Console
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="googleOAuthClientId">Client ID</Label>
              <Input
                id="googleOAuthClientId"
                type={showSecrets ? "text" : "password"}
                value={credentials.googleOAuthClientId || ""}
                onChange={(e) =>
                  handleChange("googleOAuthClientId", e.target.value)
                }
                placeholder="123456789-abcdefg.apps.googleusercontent.com"
              />
            </div>
            <div>
              <Label htmlFor="googleOAuthClientSecret">Client Secret</Label>
              <Input
                id="googleOAuthClientSecret"
                type={showSecrets ? "text" : "password"}
                value={credentials.googleOAuthClientSecret || ""}
                onChange={(e) =>
                  handleChange("googleOAuthClientSecret", e.target.value)
                }
                placeholder="GOCSPX-..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Google Ads */}
        <Card>
          <CardHeader>
            <CardTitle>Google Ads (Optional)</CardTitle>
            <CardDescription>
              For conversion tracking. Get credentials from{" "}
              <a
                href="https://ads.google.com/aw/apicenter"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google Ads API Center
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="googleAdsDeveloperToken">Developer Token</Label>
              <Input
                id="googleAdsDeveloperToken"
                type={showSecrets ? "text" : "password"}
                value={credentials.googleAdsDeveloperToken || ""}
                onChange={(e) =>
                  handleChange("googleAdsDeveloperToken", e.target.value)
                }
                placeholder="abc123..."
              />
            </div>
            <div>
              <Label htmlFor="googleAdsClientId">Client ID</Label>
              <Input
                id="googleAdsClientId"
                type={showSecrets ? "text" : "password"}
                value={credentials.googleAdsClientId || ""}
                onChange={(e) =>
                  handleChange("googleAdsClientId", e.target.value)
                }
                placeholder="123456789"
              />
            </div>
            <div>
              <Label htmlFor="googleAdsClientSecret">Client Secret</Label>
              <Input
                id="googleAdsClientSecret"
                type={showSecrets ? "text" : "password"}
                value={credentials.googleAdsClientSecret || ""}
                onChange={(e) =>
                  handleChange("googleAdsClientSecret", e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="googleAdsRefreshToken">Refresh Token</Label>
              <Input
                id="googleAdsRefreshToken"
                type={showSecrets ? "text" : "password"}
                value={credentials.googleAdsRefreshToken || ""}
                onChange={(e) =>
                  handleChange("googleAdsRefreshToken", e.target.value)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Service */}
        <Card>
          <CardHeader>
            <CardTitle>Email Service</CardTitle>
            <CardDescription>
              Configure email provider for booking confirmations and notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="emailProvider">Email Provider</Label>
              <Select
                value={credentials.emailProvider || "resend"}
                onValueChange={(value) => handleChange("emailProvider", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resend">Resend</SelectItem>
                  <SelectItem value="sendgrid">SendGrid</SelectItem>
                  <SelectItem value="smtp">Custom SMTP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {credentials.emailProvider !== "smtp" && (
              <>
                <div>
                  <Label htmlFor="emailApiKey">API Key</Label>
                  <Input
                    id="emailApiKey"
                    type={showSecrets ? "text" : "password"}
                    value={credentials.emailApiKey || ""}
                    onChange={(e) =>
                      handleChange("emailApiKey", e.target.value)
                    }
                    placeholder="re_..."
                  />
                </div>
              </>
            )}

            {credentials.emailProvider === "smtp" && (
              <>
                <div>
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={credentials.smtpHost || ""}
                    onChange={(e) => handleChange("smtpHost", e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={credentials.smtpPort || 587}
                    onChange={(e) =>
                      handleChange("smtpPort", parseInt(e.target.value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="smtpUser">SMTP Username</Label>
                  <Input
                    id="smtpUser"
                    value={credentials.smtpUser || ""}
                    onChange={(e) => handleChange("smtpUser", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type={showSecrets ? "text" : "password"}
                    value={credentials.smtpPassword || ""}
                    onChange={(e) =>
                      handleChange("smtpPassword", e.target.value)
                    }
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="emailFromAddress">From Email Address</Label>
              <Input
                id="emailFromAddress"
                type="email"
                value={credentials.emailFromAddress || ""}
                onChange={(e) =>
                  handleChange("emailFromAddress", e.target.value)
                }
                placeholder="noreply@yourdomain.com"
              />
            </div>
            <div>
              <Label htmlFor="emailFromName">From Name</Label>
              <Input
                id="emailFromName"
                value={credentials.emailFromName || ""}
                onChange={(e) => handleChange("emailFromName", e.target.value)}
                placeholder="Your Business Name"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setShowSecrets(!showSecrets)}
          >
            {showSecrets ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Hide Secrets
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Show Secrets
              </>
            )}
          </Button>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Credentials
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
