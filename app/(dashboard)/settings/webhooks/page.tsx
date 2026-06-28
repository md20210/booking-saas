"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Webhook, Plus, Trash2, ExternalLink, Copy } from "lucide-react"

const WEBHOOK_EVENTS = [
  { value: 'BOOKING_CREATED', label: 'Booking Created', description: 'When a new booking is made' },
  { value: 'BOOKING_CANCELLED', label: 'Booking Cancelled', description: 'When a booking is cancelled' },
  { value: 'BOOKING_RESCHEDULED', label: 'Booking Rescheduled', description: 'When a booking is rescheduled' },
  { value: 'BOOKING_COMPLETED', label: 'Booking Completed', description: 'When a booking is completed' },
  { value: 'PAYMENT_SUCCEEDED', label: 'Payment Succeeded', description: 'When payment is successful' },
  { value: 'PAYMENT_FAILED', label: 'Payment Failed', description: 'When payment fails' },
]

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    secret: '',
    events: [] as string[],
  })

  useEffect(() => {
    fetchWebhooks()
  }, [])

  const fetchWebhooks = async () => {
    try {
      const response = await fetch('/api/webhooks')
      if (response.ok) {
        const data = await response.json()
        setWebhooks(data)
      }
    } catch (error) {
      console.error('Error fetching webhooks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchWebhooks()
        setDialogOpen(false)
        setFormData({ name: '', url: '', secret: '', events: [] })
      }
    } catch (error) {
      console.error('Error creating webhook:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this webhook?')) return

    try {
      const response = await fetch(`/api/webhooks?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchWebhooks()
      }
    } catch (error) {
      console.error('Error deleting webhook:', error)
    }
  }

  const toggleEvent = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }))
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
          <p className="text-muted-foreground">
            Connect to Zapier, n8n, Make, or custom endpoints
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Webhook</DialogTitle>
              <DialogDescription>
                Set up a webhook endpoint to receive real-time events
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="My Zapier Integration"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">Endpoint URL</Label>
                <Input
                  id="url"
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secret">Secret (Optional)</Label>
                <Input
                  id="secret"
                  type="password"
                  placeholder="webhook_secret_key"
                  value={formData.secret}
                  onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Used to verify webhook authenticity (sent in X-Webhook-Secret header)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Events to Listen For</Label>
                <div className="grid grid-cols-2 gap-3">
                  {WEBHOOK_EVENTS.map((event) => (
                    <div
                      key={event.value}
                      className={`cursor-pointer rounded-lg border p-3 transition-colors hover:border-primary ${
                        formData.events.includes(event.value)
                          ? 'border-primary bg-primary/5'
                          : ''
                      }`}
                      onClick={() => toggleEvent(event.value)}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.events.includes(event.value)}
                          onChange={() => {}}
                          className="h-4 w-4"
                        />
                        <div>
                          <p className="text-sm font-medium">{event.label}</p>
                          <p className="text-xs text-muted-foreground">{event.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleCreate} disabled={!formData.name || !formData.url || formData.events.length === 0}>
                  Create Webhook
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Webhooks List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : webhooks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Webhook className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No webhooks configured yet</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Webhook
              </Button>
            </CardContent>
          </Card>
        ) : (
          webhooks.map((webhook) => (
            <Card key={webhook.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {webhook.name}
                      {webhook.active ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs">{webhook.url}</span>
                      <button
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          navigator.clipboard.writeText(webhook.url)
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(webhook.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-2">Listening for events:</p>
                    <div className="flex flex-wrap gap-2">
                      {webhook.events.map((event: string) => (
                        <Badge key={event} variant="outline">
                          {WEBHOOK_EVENTS.find(e => e.value === event)?.label || event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {webhook.lastTriggeredAt && (
                    <p className="text-xs text-muted-foreground">
                      Last triggered: {new Date(webhook.lastTriggeredAt).toLocaleString()}
                    </p>
                  )}
                  {webhook.failureCount > 0 && (
                    <p className="text-xs text-destructive">
                      Failed attempts: {webhook.failureCount}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Integration Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Integrations</CardTitle>
          <CardDescription>
            Connect your booking system with these platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <a
            href="https://zapier.com/apps/webhooks/integrations"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:border-primary"
          >
            <div>
              <p className="font-medium">Zapier</p>
              <p className="text-sm text-muted-foreground">Connect to 5000+ apps</p>
            </div>
            <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
          </a>
          <a
            href="https://n8n.io"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:border-primary"
          >
            <div>
              <p className="font-medium">n8n</p>
              <p className="text-sm text-muted-foreground">Self-hosted automation</p>
            </div>
            <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
          </a>
          <a
            href="https://make.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:border-primary"
          >
            <div>
              <p className="font-medium">Make</p>
              <p className="text-sm text-muted-foreground">Visual automation builder</p>
            </div>
            <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
