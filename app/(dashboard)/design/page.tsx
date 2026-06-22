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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookingWidgetPreview, DesignSettings } from "@/components/admin/booking-widget-preview"
import { Loader2, Save, RotateCcw } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

const designFormSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  borderColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  fontFamily: z.string().min(1).max(100),
  headingFontSize: z.string().regex(/^\d+px$/, "Font size must be in px"),
  bodyFontSize: z.string().regex(/^\d+px$/, "Font size must be in px"),
  buttonFontSize: z.string().regex(/^\d+px$/, "Font size must be in px"),
  widgetWidth: z.string().regex(/^(\d+px|auto|\d+%)$/, "Width must be in px, %, or auto"),
  widgetHeight: z.string().regex(/^(\d+px|auto|\d+%)$/, "Height must be in px, %, or auto"),
  layoutVariant: z.enum(["calendar-left", "calendar-right", "compact", "slots-only"]),
  logoUrl: z.string().url().optional().or(z.literal("")),
  showBranding: z.boolean(),
  customCss: z.string().max(10000).optional().or(z.literal("")),
})

type DesignFormValues = z.infer<typeof designFormSchema>

const DEFAULT_SETTINGS: DesignFormValues = {
  primaryColor: "#3b82f6",
  backgroundColor: "#ffffff",
  textColor: "#1f2937",
  borderColor: "#e5e7eb",
  fontFamily: "Inter",
  headingFontSize: "24px",
  bodyFontSize: "16px",
  buttonFontSize: "16px",
  widgetWidth: "800px",
  widgetHeight: "auto",
  layoutVariant: "calendar-left",
  logoUrl: "",
  showBranding: true,
  customCss: "",
}

export default function DesignPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewSettings, setPreviewSettings] = useState<DesignSettings>(DEFAULT_SETTINGS)

  const form = useForm<DesignFormValues>({
    resolver: zodResolver(designFormSchema),
    defaultValues: DEFAULT_SETTINGS,
  })

  useEffect(() => {
    fetchDesignSettings()
  }, [])

  // Watch form values for live preview
  useEffect(() => {
    const subscription = form.watch((values) => {
      setPreviewSettings(values as DesignSettings)
    })
    return () => subscription.unsubscribe()
  }, [form])

  const fetchDesignSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/design")

      if (!response.ok) {
        throw new Error("Failed to fetch design settings")
      }

      const data = await response.json()
      const settings = data.designSettings

      form.reset({
        primaryColor: settings.primaryColor,
        backgroundColor: settings.backgroundColor,
        textColor: settings.textColor,
        borderColor: settings.borderColor,
        fontFamily: settings.fontFamily,
        headingFontSize: settings.headingFontSize,
        bodyFontSize: settings.bodyFontSize,
        buttonFontSize: settings.buttonFontSize,
        widgetWidth: settings.widgetWidth,
        widgetHeight: settings.widgetHeight,
        layoutVariant: settings.layoutVariant,
        logoUrl: settings.logoUrl || "",
        showBranding: settings.showBranding,
        customCss: settings.customCss || "",
      })

      setPreviewSettings(settings)
    } catch (err) {
      console.error("Error fetching design settings:", err)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: DesignFormValues) => {
    try {
      setSaving(true)

      const response = await fetch("/api/design", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || "Failed to save design settings")
      }

      // Show success message (you can implement toast notifications)
      alert("Design settings saved successfully!")
    } catch (error) {
      console.error("Error saving design settings:", error)
      alert(error instanceof Error ? error.message : "Failed to save design settings")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm("Are you sure you want to reset to default design settings?")) {
      form.reset(DEFAULT_SETTINGS)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading design settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Design Customizer</h1>
          <p className="text-muted-foreground">
            Customize the look and feel of your booking widget
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Settings Panel */}
        <div className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Tabs defaultValue="colors" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="colors">Colors</TabsTrigger>
                  <TabsTrigger value="typography">Typography</TabsTrigger>
                  <TabsTrigger value="layout">Layout</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="colors" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Color Settings</CardTitle>
                      <CardDescription>
                        Customize the color scheme of your booking widget
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="primaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Color</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input type="color" {...field} className="h-10 w-20" />
                              </FormControl>
                              <Input
                                type="text"
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="#3b82f6"
                                className="flex-1"
                              />
                            </div>
                            <FormDescription>
                              Used for buttons, active states, and highlights
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="backgroundColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Background Color</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input type="color" {...field} className="h-10 w-20" />
                              </FormControl>
                              <Input
                                type="text"
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="#ffffff"
                                className="flex-1"
                              />
                            </div>
                            <FormDescription>Widget background color</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="textColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Text Color</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input type="color" {...field} className="h-10 w-20" />
                              </FormControl>
                              <Input
                                type="text"
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="#1f2937"
                                className="flex-1"
                              />
                            </div>
                            <FormDescription>Main text color</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="borderColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Border Color</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input type="color" {...field} className="h-10 w-20" />
                              </FormControl>
                              <Input
                                type="text"
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="#e5e7eb"
                                className="flex-1"
                              />
                            </div>
                            <FormDescription>Border and separator color</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="typography" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Typography Settings</CardTitle>
                      <CardDescription>
                        Customize fonts and text sizes
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="fontFamily"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Font Family</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a font" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Inter">Inter</SelectItem>
                                <SelectItem value="Arial">Arial</SelectItem>
                                <SelectItem value="Helvetica">Helvetica</SelectItem>
                                <SelectItem value="Georgia">Georgia</SelectItem>
                                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                                <SelectItem value="Courier New">Courier New</SelectItem>
                                <SelectItem value="Verdana">Verdana</SelectItem>
                                <SelectItem value="Roboto">Roboto</SelectItem>
                                <SelectItem value="Open Sans">Open Sans</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>Font family for the widget</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="headingFontSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Heading Font Size</FormLabel>
                            <FormControl>
                              <Input placeholder="24px" {...field} />
                            </FormControl>
                            <FormDescription>Size for headings (e.g., 24px)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bodyFontSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Body Font Size</FormLabel>
                            <FormControl>
                              <Input placeholder="16px" {...field} />
                            </FormControl>
                            <FormDescription>Size for body text (e.g., 16px)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="buttonFontSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Button Font Size</FormLabel>
                            <FormControl>
                              <Input placeholder="16px" {...field} />
                            </FormControl>
                            <FormDescription>Size for button text (e.g., 16px)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="layout" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Layout Settings</CardTitle>
                      <CardDescription>
                        Configure the widget dimensions and layout
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="layoutVariant"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Layout Variant</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a layout" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="calendar-left">Calendar Left</SelectItem>
                                <SelectItem value="calendar-right">Calendar Right</SelectItem>
                                <SelectItem value="compact">Compact</SelectItem>
                                <SelectItem value="slots-only">Slots Only</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>Layout style for the booking widget</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="widgetWidth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Widget Width</FormLabel>
                            <FormControl>
                              <Input placeholder="800px" {...field} />
                            </FormControl>
                            <FormDescription>
                              Width (e.g., 800px, 100%, auto)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="widgetHeight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Widget Height</FormLabel>
                            <FormControl>
                              <Input placeholder="auto" {...field} />
                            </FormControl>
                            <FormDescription>
                              Height (e.g., 600px, auto)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="logoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Logo URL (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                type="url"
                                placeholder="https://example.com/logo.png"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>URL to your company logo</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="showBranding"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Show Branding</FormLabel>
                              <FormDescription>
                                Display &quot;Powered by BookingSaaS&quot; footer
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
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Advanced Settings</CardTitle>
                      <CardDescription>
                        Custom CSS for advanced customization
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="customCss"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom CSS</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="/* Add your custom CSS here */"
                                className="font-mono text-sm min-h-[200px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Add custom CSS to override default styles (max 10,000 characters)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </div>

        {/* Live Preview */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>
                See how your booking widget will look
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="bg-gray-100 min-h-[600px]">
                <BookingWidgetPreview settings={previewSettings} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
