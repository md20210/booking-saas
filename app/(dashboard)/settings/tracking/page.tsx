"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2, Save, TrendingUp } from "lucide-react"

const trackingFormSchema = z.object({
  googleAdsEnabled: z.boolean(),
  googleAdsAccountId: z.string().optional().or(z.literal("")),
  googleAdsConversionId: z.string().optional().or(z.literal("")),
  googleAdsConversionLabel: z.string().optional().or(z.literal("")),
  enhancedConversionsEnabled: z.boolean(),
  trackingMode: z.enum(["CONTINUOUS", "BATCH"]),
})

type TrackingFormValues = z.infer<typeof trackingFormSchema>

export default function TrackingSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const form = useForm<TrackingFormValues>({
    resolver: zodResolver(trackingFormSchema),
    defaultValues: {
      googleAdsEnabled: false,
      googleAdsAccountId: "",
      googleAdsConversionId: "",
      googleAdsConversionLabel: "",
      enhancedConversionsEnabled: false,
      trackingMode: "CONTINUOUS",
    },
  })

  useEffect(() => {
    fetchTrackingSettings()
  }, [])

  const fetchTrackingSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/tracking/settings")

      if (!response.ok) {
        throw new Error("Failed to fetch tracking settings")
      }

      const data = await response.json()
      const settings = data.trackingSettings

      form.reset({
        googleAdsEnabled: settings.googleAdsEnabled,
        googleAdsAccountId: settings.googleAdsAccountId || "",
        googleAdsConversionId: settings.googleAdsConversionId || "",
        googleAdsConversionLabel: settings.googleAdsConversionLabel || "",
        enhancedConversionsEnabled: settings.enhancedConversionsEnabled,
        trackingMode: settings.trackingMode,
      })
    } catch (err) {
      console.error("Error fetching tracking settings:", err)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: TrackingFormValues) => {
    try {
      setSaving(true)

      const response = await fetch("/api/tracking/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to save tracking settings")
      }

      alert("Tracking settings saved successfully!")
    } catch (error) {
      console.error("Error saving tracking settings:", error)
      alert(error instanceof Error ? error.message : "Failed to save tracking settings")
    } finally {
      setSaving(false)
    }
  }

  const googleAdsEnabled = form.watch("googleAdsEnabled")

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tracking settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tracking Settings</h1>
          <p className="text-muted-foreground">
            Configure Google Ads conversion tracking
          </p>
        </div>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <CardTitle>Google Ads Conversion Tracking</CardTitle>
              </div>
              <CardDescription>
                Track bookings as conversions in Google Ads for campaign optimization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="googleAdsEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Google Ads Tracking</FormLabel>
                      <FormDescription>
                        Send booking conversions to Google Ads
                      </FormDescription>
                    </div>
                    <FormControl>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={field.value}
                        onClick={() => field.onChange(!field.value)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          field.value ? "bg-primary" : "bg-input"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-background shadow-lg transition-transform ${
                            field.value ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </FormControl>
                  </FormItem>
                )}
              />

              {googleAdsEnabled && (
                <>
                  <FormField
                    control={form.control}
                    name="googleAdsAccountId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Google Ads Account ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123-456-7890"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Your Google Ads customer ID (format: XXX-XXX-XXXX)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="googleAdsConversionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conversion ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="AW-123456789"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Your Google Ads conversion ID (format: AW-XXXXXXXXX)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="googleAdsConversionLabel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conversion Label</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="AbC1DefGhIjK2LmNoPq"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Your conversion action label from Google Ads
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="trackingMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tracking Mode</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select tracking mode" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CONTINUOUS">
                              Continuous (Send immediately)
                            </SelectItem>
                            <SelectItem value="BATCH">
                              Batch (Send once per night)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Continuous sends conversions immediately. Batch sends them once per night.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enhancedConversionsEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Enhanced Conversions</FormLabel>
                          <FormDescription>
                            Send hashed user data (email, phone) for better attribution
                          </FormDescription>
                        </div>
                        <FormControl>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={field.value}
                            onClick={() => field.onChange(!field.value)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              field.value ? "bg-primary" : "bg-input"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-background shadow-lg transition-transform ${
                                field.value ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </>
              )}

              <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
                <p className="font-medium mb-2">Setup Instructions:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Create a conversion action in Google Ads</li>
                  <li>Copy the Conversion ID and Label from Google Ads</li>
                  <li>Enter your Google Ads Account ID above</li>
                  <li>Save your settings</li>
                  <li>Test by making a booking and checking Google Ads</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  )
}
