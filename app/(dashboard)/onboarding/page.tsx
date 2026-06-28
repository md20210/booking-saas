"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Calendar, Palette, Link as LinkIcon, Loader2 } from "lucide-react"

const STEPS = [
  {
    id: 1,
    title: "Create Your First Event",
    description: "Set up your first booking event type",
  },
  {
    id: 2,
    title: "Connect Calendar",
    description: "Integrate with Google Calendar or Outlook",
  },
  {
    id: 3,
    title: "Customize Design",
    description: "Make your booking page match your brand",
  },
  {
    id: 4,
    title: "You're Ready!",
    description: "Get your booking link and start accepting appointments",
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [eventData, setEventData] = useState({
    title: "30 Minute Meeting",
    slug: "30-minute-meeting",
    description: "A brief 30-minute meeting to discuss your needs",
    duration: 30,
  })
  const [createdEventId, setCreatedEventId] = useState<string | null>(null)
  const [hasCalendar, setHasCalendar] = useState(false)

  const progress = (currentStep / STEPS.length) * 100

  const createEvent = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...eventData,
          bufferTime: 0,
          price: 0,
          currency: "EUR",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create event")
      }

      const result = await response.json()
      setCreatedEventId(result.eventType.id)
      setCurrentStep(2)
    } catch (error) {
      console.error("Error creating event:", error)
      alert("Failed to create event. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const checkCalendarIntegration = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/integrations/status")
      if (response.ok) {
        const data = await response.json()
        const connected = data.google?.active || data.outlook?.active
        setHasCalendar(connected)
        if (connected) {
          setCurrentStep(3)
        }
      }
    } catch (error) {
      console.error("Error checking calendar integration:", error)
    } finally {
      setLoading(false)
    }
  }

  const skipCalendar = () => {
    setCurrentStep(3)
  }

  const finishOnboarding = async () => {
    setLoading(true)
    try {
      // Mark onboarding as complete
      await fetch("/api/user/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: true }),
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error completing onboarding:", error)
      // Still redirect even if API fails
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Welcome to BookingSaaS! 🎉</h1>
          <p className="text-muted-foreground text-lg">
            Let's get you set up in just a few steps
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Step {currentStep} of {STEPS.length}</span>
            <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps Timeline */}
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  currentStep > step.id
                    ? "bg-green-100 text-green-700"
                    : currentStep === step.id
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {currentStep > step.id ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <span className="font-semibold">{step.id}</span>
                )}
                <span className="hidden md:inline">{step.title}</span>
              </div>
              {index < STEPS.length - 1 && (
                <div className="w-8 h-0.5 bg-gray-200 mx-1" />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 1 && <Calendar className="h-6 w-6" />}
              {currentStep === 2 && <LinkIcon className="h-6 w-6" />}
              {currentStep === 3 && <Palette className="h-6 w-6" />}
              {currentStep === 4 && <CheckCircle2 className="h-6 w-6 text-green-600" />}
              {STEPS[currentStep - 1].title}
            </CardTitle>
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Create Event */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    value={eventData.title}
                    onChange={(e) =>
                      setEventData({
                        ...eventData,
                        title: e.target.value,
                        slug: e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-+|-+$/g, ""),
                      })
                    }
                    placeholder="30 Minute Meeting"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={eventData.slug}
                    onChange={(e) => setEventData({ ...eventData, slug: e.target.value })}
                    placeholder="30-minute-meeting"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your booking link: yoursite.com/book/{eventData.slug}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={eventData.description}
                    onChange={(e) =>
                      setEventData({ ...eventData, description: e.target.value })
                    }
                    placeholder="Describe what this meeting is for..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={eventData.duration}
                    onChange={(e) =>
                      setEventData({ ...eventData, duration: parseInt(e.target.value) })
                    }
                    min="5"
                    max="480"
                  />
                </div>

                <Button onClick={createEvent} disabled={loading} className="w-full" size="lg">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Event & Continue
                </Button>
              </div>
            )}

            {/* Step 2: Connect Calendar */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Why connect a calendar?</strong> We'll automatically create calendar
                    events and video meeting links (Google Meet or Teams) for all your bookings.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border-2 hover:border-blue-500 transition-colors cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        Google Calendar
                      </CardTitle>
                      <CardDescription>
                        Sync with Google Calendar + Google Meet
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => window.location.href = "/api/integrations/google/auth"}
                        className="w-full"
                      >
                        Connect Google
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 hover:border-indigo-500 transition-colors cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-indigo-600" />
                        Microsoft Outlook
                      </CardTitle>
                      <CardDescription>
                        Sync with Outlook + Microsoft Teams
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => window.location.href = "/api/integrations/outlook/auth"}
                        variant="outline"
                        className="w-full"
                      >
                        Connect Outlook
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={checkCalendarIntegration}
                    disabled={loading}
                    variant="default"
                    className="flex-1"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    I've Connected a Calendar
                  </Button>
                  <Button onClick={skipCalendar} variant="outline" className="flex-1">
                    Skip for Now
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Customize Design */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-purple-900">
                    <strong>Make it yours!</strong> You can customize your booking page's colors,
                    fonts, and layout to match your brand. We've set up a professional default
                    theme for you.
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="border rounded-lg p-4 space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Available Customizations
                    </h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>✓ Brand colors and fonts</li>
                      <li>✓ Custom logo</li>
                      <li>✓ 10 pre-built templates</li>
                      <li>✓ Custom CSS support</li>
                      <li>✓ White-label (remove branding)</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => router.push("/design")}
                    variant="outline"
                    className="flex-1"
                  >
                    Customize Design
                  </Button>
                  <Button onClick={() => setCurrentStep(4)} className="flex-1">
                    Use Default Theme
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Complete */}
            {currentStep === 4 && (
              <div className="space-y-6 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-2">You're All Set! 🎉</h3>
                  <p className="text-muted-foreground">
                    Your booking system is ready to accept appointments
                  </p>
                </div>

                {createdEventId && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Your Booking Link</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="bg-white p-3 rounded border font-mono text-sm break-all">
                        {typeof window !== "undefined" &&
                          `${window.location.origin}/book/${eventData.slug}`}
                      </div>
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/book/${eventData.slug}`
                          )
                          alert("Booking link copied to clipboard!")
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        Copy Link
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <div className="grid gap-3 md:grid-cols-2">
                  <Card className="text-left">
                    <CardHeader>
                      <CardTitle className="text-base">Next Steps</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                      <p>• Share your booking link with clients</p>
                      <p>• Customize your brand design</p>
                      <p>• Set up Google Ads tracking</p>
                      <p>• Create more event types</p>
                    </CardContent>
                  </Card>

                  <Card className="text-left">
                    <CardHeader>
                      <CardTitle className="text-base">Resources</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                      <p>• WordPress Plugin available</p>
                      <p>• API documentation</p>
                      <p>• White-label options</p>
                      <p>• Priority support</p>
                    </CardContent>
                  </Card>
                </div>

                <Button onClick={finishOnboarding} disabled={loading} size="lg" className="w-full">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Go to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skip Button */}
        {currentStep < 4 && (
          <div className="text-center">
            <Button
              onClick={() => router.push("/dashboard")}
              variant="ghost"
              className="text-muted-foreground"
            >
              Skip onboarding and go to dashboard →
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
