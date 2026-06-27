"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
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
import { Textarea } from "@/components/ui/textarea"
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
import { ArrowLeft, Loader2, Trash2 } from "lucide-react"
import Link from "next/link"

const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50, "Slug too long")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  description: z.string().optional(),
  duration: z
    .number()
    .int()
    .min(5, "Duration must be at least 5 minutes")
    .max(1440, "Duration cannot exceed 24 hours"),
  bufferTime: z.number().int().min(0).max(120),
  price: z.number().nonnegative().optional(),
  currency: z.string().length(3),
})

type EventFormValues = z.infer<typeof eventFormSchema>

interface EventType {
  id: string
  title: string
  slug: string
  description?: string | null
  duration: number
  bufferTime: number
  price?: number | null
  currency: string
  active: boolean
}

export default function EditEventPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string

  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [event, setEvent] = useState<EventType | null>(null)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      duration: 30,
      bufferTime: 0,
      price: 0,
      currency: "EUR",
    },
  })

  useEffect(() => {
    fetchEvent()
  }, [eventId])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/events/${eventId}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Event not found")
        }
        throw new Error("Failed to fetch event")
      }

      const data = await response.json()
      const eventData = data.eventType

      setEvent(eventData)

      // Pre-fill form with event data
      form.reset({
        title: eventData.title,
        slug: eventData.slug,
        description: eventData.description || "",
        duration: eventData.duration,
        bufferTime: eventData.bufferTime,
        price: eventData.price || 0,
        currency: eventData.currency,
      })
    } catch (err) {
      console.error("Error fetching event:", err)
      setError(err instanceof Error ? err.message : "Failed to load event")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: EventFormValues) => {
    try {
      const payload = {
        ...data,
        price: data.price && data.price > 0 ? data.price : undefined,
      }

      const response = await fetch(`/api/events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          form.setError("slug", {
            message: "This slug already exists. Please choose a different one.",
          })
          return
        }

        if (result.details) {
          // Handle validation errors
          result.details.forEach((error: any) => {
            const field = error.path[0] as keyof EventFormValues
            form.setError(field, {
              message: error.message,
            })
          })
          return
        }

        throw new Error(result.error || "Failed to update event")
      }

      router.push("/events")
      router.refresh()
    } catch (error) {
      console.error("Error updating event:", error)
      form.setError("root", {
        message:
          error instanceof Error ? error.message : "Failed to update event",
      })
    }
  }

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${event?.title}"? This action cannot be undone.`
      )
    ) {
      return
    }

    try {
      setDeleting(true)

      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || "Failed to delete event")
      }

      router.push("/events")
      router.refresh()
    } catch (error) {
      console.error("Error deleting event:", error)
      alert(error instanceof Error ? error.message : "Failed to delete event")
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading event...</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || "Event not found"}</p>
          <Button asChild>
            <Link href="/events">Back to Events</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/events">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Edit Event Type</h1>
          <p className="text-muted-foreground">
            Update the settings for {event.title}
          </p>
        </div>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="mr-2 h-4 w-4" />
          )}
          Delete
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            Update the settings for your event type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="30 Minute Meeting" {...field} />
                    </FormControl>
                    <FormDescription>
                      The name of your event type (e.g., "Discovery Call",
                      "Consulting Session")
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="30-minute-meeting" {...field} />
                    </FormControl>
                    <FormDescription>
                      Used in your booking link (e.g.,
                      yourdomain.com/book/30-minute-meeting)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what this event is for..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional description shown to people booking this event
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" min="5" max="1440" {...field} />
                      </FormControl>
                      <FormDescription>Event duration in minutes</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bufferTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buffer Time (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="120" {...field} />
                      </FormControl>
                      <FormDescription>
                        Time between events
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Leave 0 for free events</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="CAD">CAD ($)</SelectItem>
                          <SelectItem value="AUD">AUD ($)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Event pricing currency</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {form.formState.errors.root && (
                <div className="rounded-md bg-destructive/15 p-3">
                  <p className="text-sm text-destructive">
                    {form.formState.errors.root.message}
                  </p>
                </div>
              )}

              <div className="flex gap-4 justify-end">
                <Button type="button" variant="outline" asChild>
                  <Link href="/events">Cancel</Link>
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
