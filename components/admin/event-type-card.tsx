"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Clock, DollarSign } from "lucide-react"

interface EventTypeCardProps {
  id: string
  title: string
  description?: string
  duration: number
  price?: number
  isActive: boolean
  onToggleActive?: (id: string, isActive: boolean) => void
  onDelete?: (id: string) => void
}

export function EventTypeCard({
  id,
  title,
  description,
  duration,
  price,
  isActive,
  onToggleActive,
  onDelete,
}: EventTypeCardProps) {
  const [active, setActive] = useState(isActive)

  const handleToggle = () => {
    const newState = !active
    setActive(newState)
    onToggleActive?.(id, newState)
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      onDelete?.(id)
    }
  }

  return (
    <Card className={!active ? "opacity-60" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && (
              <CardDescription className="line-clamp-2">
                {description}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                active ? "bg-primary" : "bg-input"
              }`}
              role="switch"
              aria-checked={active}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-background shadow-lg ring-0 transition-transform ${
                  active ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{duration} min</span>
          </div>
          {price !== undefined && price > 0 && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>${price}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href={`/events/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          className="flex-1"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}
