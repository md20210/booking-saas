"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Users, Plus, Trash2, Mail, Calendar } from "lucide-react"

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'MEMBER' as 'ADMIN' | 'MEMBER',
    googleCalendarId: '',
    outlookCalendarId: '',
    priority: 0,
    active: true,
  })

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('/api/team')
      if (response.ok) {
        const data = await response.json()
        setTeamMembers(data)
      }
    } catch (error) {
      console.error('Error fetching team members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchTeamMembers()
        setDialogOpen(false)
        setFormData({
          name: '',
          email: '',
          role: 'MEMBER',
          googleCalendarId: '',
          outlookCalendarId: '',
          priority: 0,
          active: true,
        })
      }
    } catch (error) {
      console.error('Error creating team member:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this team member?')) return

    try {
      const response = await fetch(`/api/team?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchTeamMembers()
      }
    } catch (error) {
      console.error('Error deleting team member:', error)
    }
  }

  const toggleActive = async (member: any) => {
    try {
      const response = await fetch('/api/team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: member.id,
          active: !member.active,
        }),
      })

      if (response.ok) {
        await fetchTeamMembers()
      }
    } catch (error) {
      console.error('Error updating team member:', error)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">
            Manage team members for round-robin scheduling
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Add a team member to distribute bookings via round-robin
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="googleCal">Google Calendar ID (Optional)</Label>
                <Input
                  id="googleCal"
                  placeholder="john@company.com"
                  value={formData.googleCalendarId}
                  onChange={(e) => setFormData({ ...formData, googleCalendarId: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  For checking availability and creating calendar events
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="outlookCal">Outlook Calendar ID (Optional)</Label>
                <Input
                  id="outlookCal"
                  placeholder="john@company.com"
                  value={formData.outlookCalendarId}
                  onChange={(e) => setFormData({ ...formData, outlookCalendarId: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority (0-100)</Label>
                <Input
                  id="priority"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground">
                  Higher priority = receives more bookings in round-robin
                </p>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleCreate} disabled={!formData.name || !formData.email}>
                  Add Member
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Members List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : teamMembers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No team members yet</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Team Member
              </Button>
            </CardContent>
          </Card>
        ) : (
          teamMembers.map((member) => (
            <Card key={member.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {member.name}
                        {member.role === 'ADMIN' && <Badge>Admin</Badge>}
                        {member.active ? (
                          <Badge variant="default" className="bg-green-600">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={member.active}
                      onCheckedChange={() => toggleActive(member)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {member.googleCalendarId && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Google Calendar: {member.googleCalendarId}
                    </div>
                  )}
                  {member.outlookCalendarId && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Outlook Calendar: {member.outlookCalendarId}
                    </div>
                  )}
                  <p className="text-muted-foreground">Priority: {member.priority}</p>
                  <p className="text-xs text-muted-foreground">
                    Added: {new Date(member.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* How Round Robin Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Round-Robin Scheduling Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              1
            </div>
            <div>
              <p className="font-medium">Customer books a team event</p>
              <p className="text-sm text-muted-foreground">
                System checks which team members are active
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              2
            </div>
            <div>
              <p className="font-medium">Checks availability via calendar integration</p>
              <p className="text-sm text-muted-foreground">
                Filters out members who are busy at the requested time
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              3
            </div>
            <div>
              <p className="font-medium">Assigns to next member in rotation (weighted by priority)</p>
              <p className="text-sm text-muted-foreground">
                Higher priority members receive proportionally more bookings
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
