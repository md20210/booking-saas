"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { EventTypeCard } from "@/components/admin/event-type-card"
import { Plus, Calendar } from "lucide-react"

interface EventType {
  id: string
  title: string
  slug: string
  description?: string
  duration: number
  bufferTime: number
  price?: number
  currency: string
  active: boolean
  _count?: {
    bookings: number
  }
}

export default function EventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/events")

      if (!response.ok) {
        throw new Error("Failed to fetch events")
      }

      const data = await response.json()
      setEvents(data.eventTypes || [])
    } catch (err) {
      console.error("Error fetching events:", err)
      setError(err instanceof Error ? err.message : "Failed to load events")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: isActive }),
      })

      if (!response.ok) {
        throw new Error("Failed to update event")
      }

      // Update local state
      setEvents((prev) =>
        prev.map((event) =>
          event.id === id ? { ...event, active: isActive } : event
        )
      )
    } catch (err) {
      console.error("Error toggling event status:", err)
      // Refresh the list to revert changes
      fetchEvents()
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete event")
      }

      // Remove from local state
      setEvents((prev) => prev.filter((event) => event.id !== id))
    } catch (err) {
      console.error("Error deleting event:", err)
      alert(err instanceof Error ? err.message : "Failed to delete event")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchEvents}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Types</h1>
          <p className="text-muted-foreground">
            Create and manage your event types
          </p>
        </div>
        <Button asChild>
          <Link href="/events/new">
            <Plus className="mr-2 h-4 w-4" />
            Create New Event
          </Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg p-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No event types yet</h2>
          <p className="text-muted-foreground mb-6 text-center max-w-sm">
            Get started by creating your first event type. Event types define
            the meetings you want to schedule.
          </p>
          <Button asChild>
            <Link href="/events/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Event
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventTypeCard
              key={event.id}
              id={event.id}
              title={event.title}
              description={event.description}
              duration={event.duration}
              price={event.price}
              isActive={event.active}
              onToggleActive={handleToggleActive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
