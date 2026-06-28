"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Save, BarChart3 } from "lucide-react"

export default function AnalyticsSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [clarityId, setClarityId] = useState("")

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/settings/analytics")

      if (response.ok) {
        const data = await response.json()
        setClarityId(data.microsoftClarityId || "")
      }
    } catch (error) {
      console.error("Error fetching analytics settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const response = await fetch("/api/settings/analytics", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          microsoftClarityId: clarityId || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      alert("Analytics settings saved successfully!")
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Settings</h1>
        <p className="text-muted-foreground">
          Configure analytics tracking for your booking pages
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <CardTitle>Microsoft Clarity</CardTitle>
          </div>
          <CardDescription>
            Track user behavior on your booking pages with heatmaps, session recordings, and
            insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clarityId">Clarity Project ID</Label>
            <Input
              id="clarityId"
              value={clarityId}
              onChange={(e) => setClarityId(e.target.value)}
              placeholder="e.g., abc123xyz"
            />
            <p className="text-sm text-muted-foreground">
              Get your Project ID from{" "}
              <a
                href="https://clarity.microsoft.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Microsoft Clarity Dashboard
              </a>
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              📊 What you get with Clarity:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Heatmaps showing where users click and scroll</li>
              <li>• Session recordings to see user journeys</li>
              <li>• Insights on user frustration and rage clicks</li>
              <li>• Conversion funnel analysis</li>
              <li>• 100% free, no limits</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-yellow-900 mb-2">
              🔒 Privacy & GDPR
            </h4>
            <p className="text-sm text-yellow-800">
              Microsoft Clarity is GDPR-compliant and respects user privacy. Make sure to
              update your privacy policy to mention Clarity tracking.
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
            <Button
              onClick={() => setClarityId("")}
              disabled={saving || !clarityId}
              variant="outline"
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Sign up for Microsoft Clarity</p>
                <p className="text-muted-foreground">
                  Visit{" "}
                  <a
                    href="https://clarity.microsoft.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    clarity.microsoft.com
                  </a>{" "}
                  and create a free account
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                2
              </div>
              <div>
                <p className="font-medium">Create a new project</p>
                <p className="text-muted-foreground">
                  Add your booking domain and get your Project ID
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Paste your Project ID above</p>
                <p className="text-muted-foreground">
                  Clarity will automatically track all your booking pages
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                4
              </div>
              <div>
                <p className="font-medium">View insights in Clarity Dashboard</p>
                <p className="text-muted-foreground">
                  Analyze user behavior and optimize your booking conversion rate
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
