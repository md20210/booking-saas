"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, AlertCircle, CheckCircle2 } from "lucide-react"

export default function PaymentSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<any>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [formData, setFormData] = useState({
    stripePublishableKey: '',
    stripeSecretKey: '',
    stripeEnabled: false,
    defaultCurrency: 'EUR',
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings/payments')
      if (response.ok) {
        const data = await response.json()
        if (data) {
          setSettings(data)
          setFormData({
            stripePublishableKey: data.stripePublishableKey || '',
            stripeSecretKey: '', // Never send back
            stripeEnabled: data.stripeEnabled || false,
            defaultCurrency: data.defaultCurrency || 'EUR',
          })
        }
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)

      const response = await fetch('/api/settings/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        setMessage({ type: 'success', text: 'Payment settings saved successfully!' })
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save payment settings' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Settings</h1>
        <p className="text-muted-foreground">
          Configure Stripe to accept payments for your bookings
        </p>
      </div>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Stripe Configuration
          </CardTitle>
          <CardDescription>
            Get your API keys from{' '}
            <a
              href="https://dashboard.stripe.com/apikeys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Stripe Dashboard
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="publishableKey">Publishable Key</Label>
            <Input
              id="publishableKey"
              placeholder="pk_live_..."
              value={formData.stripePublishableKey}
              onChange={(e) =>
                setFormData({ ...formData, stripePublishableKey: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              Starts with pk_test_ or pk_live_
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secretKey">Secret Key</Label>
            <Input
              id="secretKey"
              type="password"
              placeholder="sk_live_..."
              value={formData.stripeSecretKey}
              onChange={(e) =>
                setFormData({ ...formData, stripeSecretKey: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              Starts with sk_test_ or sk_live_ (stored securely, never shown)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Default Currency</Label>
            <select
              id="currency"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.defaultCurrency}
              onChange={(e) =>
                setFormData({ ...formData, defaultCurrency: e.target.value })
              }
            >
              <option value="EUR">EUR - Euro</option>
              <option value="USD">USD - US Dollar</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CHF">CHF - Swiss Franc</option>
              <option value="JPY">JPY - Japanese Yen</option>
            </select>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Enable Stripe Payments</Label>
              <p className="text-sm text-muted-foreground">
                Allow customers to pay for bookings via Stripe
              </p>
            </div>
            <Switch
              id="enabled"
              checked={formData.stripeEnabled}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, stripeEnabled: checked })
              }
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
            <Button variant="outline" onClick={fetchSettings}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle>How Stripe Payments Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              1
            </div>
            <div>
              <p className="font-medium">Customer books an event with price &gt; 0</p>
              <p className="text-sm text-muted-foreground">
                They're redirected to Stripe Checkout to pay
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              2
            </div>
            <div>
              <p className="font-medium">Payment is processed securely by Stripe</p>
              <p className="text-sm text-muted-foreground">
                Card details never touch your server
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              3
            </div>
            <div>
              <p className="font-medium">Booking is confirmed after successful payment</p>
              <p className="text-sm text-muted-foreground">
                Calendar invite and confirmation email sent automatically
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
