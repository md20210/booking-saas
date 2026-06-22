# Admin Dashboard Components

This directory contains reusable components for the booking SaaS admin dashboard.

## Components

### DashboardSidebar

A sidebar navigation component with links to all main dashboard sections.

**Features:**
- Logo at top
- Navigation items: Dashboard, Events, Design, Integrations, Settings
- Active state highlighting with primary color
- Responsive icons from lucide-react

**Usage:**
```tsx
import { DashboardSidebar } from "@/components/admin"

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <main className="flex-1">{children}</main>
    </div>
  )
}
```

### DashboardHeader

Header component with user session information and dropdown menu.

**Features:**
- User avatar (image or initials)
- User name and email display
- Dropdown menu with: Profile, API Keys, Settings, Sign Out
- Integrates with NextAuth session

**Usage:**
```tsx
import { DashboardHeader } from "@/components/admin"

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1">
        {/* sidebar and content */}
      </div>
    </div>
  )
}
```

### EventTypeCard

Card component for displaying event types in a list or grid.

**Features:**
- Displays: title, description, duration, price (optional)
- Edit and Delete action buttons
- Active/Inactive toggle switch
- Visual feedback for inactive events

**Props:**
```tsx
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
```

**Usage:**
```tsx
import { EventTypeCard } from "@/components/admin"

export default function EventsPage() {
  const handleToggle = (id: string, isActive: boolean) => {
    // Update event active status in database
    console.log(`Event ${id} is now ${isActive ? 'active' : 'inactive'}`)
  }

  const handleDelete = (id: string) => {
    // Delete event from database
    console.log(`Deleting event ${id}`)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <EventTypeCard
        id="1"
        title="30-Minute Consultation"
        description="Quick consultation call for project discussion"
        duration={30}
        price={50}
        isActive={true}
        onToggleActive={handleToggle}
        onDelete={handleDelete}
      />
      <EventTypeCard
        id="2"
        title="1-Hour Strategy Session"
        description="In-depth strategy planning session"
        duration={60}
        price={150}
        isActive={false}
        onToggleActive={handleToggle}
        onDelete={handleDelete}
      />
    </div>
  )
}
```

## Complete Layout Example

Here's a complete example combining all components:

```tsx
// app/dashboard/layout.tsx
import { DashboardSidebar, DashboardHeader } from "@/components/admin"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

## Dependencies

All components use:
- **shadcn/ui components**: Card, Button, DropdownMenu
- **lucide-react icons**: For all icons
- **next-auth**: For session management (DashboardHeader)
- **Next.js 13+**: App router conventions (usePathname, Link)

## Styling

Components use Tailwind CSS and follow the project's design system. They support:
- Light/dark mode (via CSS variables)
- Responsive design
- Accessible markup (ARIA labels, semantic HTML)
