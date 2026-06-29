# UI Redesign Specification - Professional Calendly Competitor

## Executive Summary
Complete UI overhaul to match Calendly's professional design standards. Focus on modern, clean design with perfect mobile responsiveness.

## Current State Analysis

### Issues Identified:
1. Mobile register form not properly centered
2. Homepage lacks modern hero section
3. No proper navigation bar
4. Missing dashboard with sidebar
5. No booking widget calendar UI
6. Settings pages need professional forms
7. Overall design feels basic, not production-ready

## Design System

### Colors (Calendly-inspired)
```css
Primary Blue: #0069FF
Primary Blue Hover: #0052CC
Success Green: #00B87C
Warning Orange: #FF9900
Error Red: #E41E26
Background: #F8F9FA
Dark Background: #1A1A1A
Text Primary: #1A1A1A
Text Secondary: #6B7280
Border: #E5E7EB
```

### Typography
```css
Headings: Inter, -apple-system, BlinkMacSystemFont
Body: Inter, sans-serif
Monospace: 'JetBrains Mono', monospace
```

### Spacing Scale
```
xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
2xl: 3rem (48px)
3xl: 4rem (64px)
```

## Components to Build

### 1. Navigation Bar
**Location:** `components/navigation/Navbar.tsx`

**Features:**
- Logo on left
- Navigation links (Features, Pricing, About)
- User menu on right (when logged in)
- Sign In / Get Started buttons (when logged out)
- Mobile hamburger menu
- Sticky on scroll

**Responsive:**
- Desktop: Full menu
- Tablet: Condensed menu
- Mobile: Hamburger menu

---

### 2. Hero Section (Homepage)
**Location:** `app/page.tsx` or `components/home/HeroSection.tsx`

**Layout:**
```
[Left 50%]                    [Right 50%]
- Headline                    - Screenshot/Demo
- Subheadline                 - Or animated preview
- 2 CTA buttons
- Trust badges
```

**Content:**
- Headline: "Scheduling Made Simple"
- Subheadline: "Professional appointment scheduling with video calls, reminders & payments built in"
- Primary CTA: "Start Free Trial"
- Secondary CTA: "Watch Demo"
- Trust: "Trusted by 10,000+ professionals"

---

### 3. Features Section
**Location:** `components/home/FeaturesSection.tsx`

**Grid Layout:** 3 columns desktop, 2 tablet, 1 mobile

**Features to highlight:**
1. Calendar Sync (Google, Outlook)
2. Video Conferencing (Meet, Teams, Zoom)
3. Payment Processing (Stripe)
4. Email & SMS Reminders
5. Team Scheduling
6. Custom Branding
7. Webhooks & API
8. Analytics & Reporting

**Each feature card:**
- Icon (use lucide-react)
- Title
- Description (2-3 lines)
- "Learn more" link

---

### 4. Dashboard Layout
**Location:** `app/(dashboard)/layout.tsx`

**Structure:**
```
[Sidebar - 250px]     [Main Content]
- Logo                - Top bar (breadcrumbs, user menu)
- Nav Items           - Page content
  - Dashboard
  - Event Types
  - Bookings
  - Team
  - Settings
- User Profile
- Upgrade button
```

**Sidebar items:**
```typescript
const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Event Types', href: '/events', icon: Calendar },
  { name: 'Bookings', href: '/bookings', icon: Clock },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
]
```

**Mobile:** Collapsible sidebar, hamburger menu

---

### 5. Dashboard Home Page
**Location:** `app/(dashboard)/dashboard/page.tsx`

**Widgets:**
1. **Stats Cards** (4 across)
   - Total Bookings (this month)
   - Upcoming Events
   - Revenue (if payments enabled)
   - Conversion Rate

2. **Upcoming Bookings** (list)
   - Next 5 bookings
   - Show: Time, Client name, Event type
   - Quick actions: Reschedule, Cancel

3. **Recent Activity** (timeline)
   - Last 10 actions
   - Types: Booking created, Payment received, Event canceled

4. **Quick Actions**
   - Create Event Type
   - View Calendar
   - Share Booking Link

---

### 6. Event Types Page
**Location:** `app/(dashboard)/events/page.tsx`

**Layout:**
- Header with "Create Event Type" button
- Grid of event type cards (2-3 columns)
- Each card shows:
  - Event name
  - Duration
  - Price (if paid)
  - Booking link (copy button)
  - Edit/Delete actions

**Empty State:**
- Illustration
- "No event types yet"
- "Create your first event type" button

---

### 7. Create/Edit Event Type Form
**Location:** `app/(dashboard)/events/new/page.tsx`

**Form Sections:**
1. **Basic Info**
   - Event name *
   - Description (rich text editor)
   - Duration (15, 30, 45, 60 min dropdown)
   - Location type (Video call, Phone, In-person)

2. **Availability**
   - Working hours (Mon-Fri 9-5 default)
   - Buffer time before/after
   - Max bookings per day

3. **Video Conference** (if selected)
   - Provider: Google Meet / Teams / Zoom / Custom
   - Auto-generate links checkbox

4. **Payment** (optional)
   - Enable paid bookings toggle
   - Price input
   - Currency dropdown

5. **Reminders**
   - Email reminders (checkboxes: 1h, 24h, 1 week)
   - SMS reminders (checkboxes: 1h, 24h)

6. **Custom Fields**
   - Add custom questions for guests
   - Types: Text, Email, Phone, Dropdown

**Buttons:**
- Save Draft
- Publish Event
- Cancel

**Mobile:** Stack all sections vertically, full width inputs

---

### 8. Booking Widget (Public)
**Location:** `app/(public)/book/[slug]/page.tsx`

**Layout (2-column):**

```
[Left - Event Info]           [Right - Calendar]
- Event name                  - Month/Year selector
- Host photo                  - Calendar grid
- Duration                    - Available time slots
- Description                 - Selected date highlighted
- Meeting type
```

**Calendar Component:**
- Month view
- Highlight available days
- Grey out unavailable days
- Click day → show time slots
- Time slots in user's timezone

**Booking Form (after selecting time):**
- Guest name *
- Guest email *
- Guest phone (if required)
- Custom questions
- Add to calendar checkbox
- Terms acceptance
- "Confirm Booking" button

**After Booking:**
- Success message
- Calendar download buttons (Google, Outlook, iCal)
- Meeting link (if video call)
- "Add to Calendar" button

**Mobile:**
- Stack left/right to vertical
- Calendar takes full width
- Time slots as list below calendar

---

### 9. Settings Pages

#### 9.1 Settings Layout
**Location:** `app/(dashboard)/settings/layout.tsx`

**Tabs:**
- Profile
- Integrations
- Reminders
- Payments
- Webhooks
- Team
- API Keys

#### 9.2 Reminder Settings
**Location:** `app/(dashboard)/settings/reminders/page.tsx`

**Content:**
- Email provider selection (Resend, SendGrid, SMTP)
- API key input
- Test email button
- SMS provider (Twilio)
- SMS settings
- Default reminder times
- Save button

#### 9.3 Payment Settings
**Location:** `app/(dashboard)/settings/payments/page.tsx`

**Content:**
- Stripe Connect button
- Account status
- Default currency
- Tax settings
- Payout schedule
- Transaction history

#### 9.4 Webhook Settings
**Location:** `app/(dashboard)/settings/webhooks/page.tsx`

**Content:**
- Webhook URL input
- Secret key (auto-generated)
- Events to subscribe (checkboxes)
- Test webhook button
- Webhook logs (recent 10)

---

### 10. Auth Pages

#### 10.1 Login Page
**Location:** `app/(auth)/login/page.tsx`

**Layout:**
```
[Centered Card - max 400px]
- Logo
- "Welcome back" heading
- Email input
- Password input
- Remember me checkbox
- "Forgot password?" link
- "Sign In" button (full width)
- Divider "or"
- "Sign in with Google" button
- "Don't have an account? Sign up" link
```

**Mobile:** Same layout, full width card with padding

#### 10.2 Register Page
**Location:** `app/(auth)/register/page.tsx`

**Layout:** Similar to login but with:
- Name input (added)
- Terms acceptance checkbox
- "Already have an account? Sign in" link

---

### 11. Responsive Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

**Mobile-first approach:**
- Base styles for mobile
- Use `md:` prefix for tablet+
- Use `lg:` prefix for desktop+

---

## Implementation Priority

### Phase 1: Core Pages (Week 1)
1. Navigation bar
2. Homepage redesign
3. Login/Register pages
4. Dashboard layout

### Phase 2: Main Features (Week 2)
5. Dashboard home page
6. Event types page
7. Booking widget
8. Event type creation form

### Phase 3: Settings & Polish (Week 3)
9. Settings pages
10. Mobile responsive testing
11. Accessibility audit
12. Performance optimization

---

## Technical Requirements

### Dependencies to Install
```bash
npm install lucide-react
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-tabs
npm install @radix-ui/react-toast
npm install react-day-picker
npm install date-fns
```

### Component Library
Use shadcn/ui components for:
- Button
- Input
- Select
- Dialog
- Dropdown Menu
- Toast
- Tabs
- Card
- Badge

### Icons
Use `lucide-react` for all icons:
```typescript
import { Calendar, Clock, Users, Settings, LayoutDashboard } from 'lucide-react'
```

---

## Testing Checklist

### Desktop (Chrome, Firefox, Safari)
- [ ] Navigation works
- [ ] Forms submit correctly
- [ ] Modals open/close
- [ ] Dropdowns work
- [ ] Calendar selectable

### Mobile (iOS Safari, Chrome)
- [ ] Touch targets 44x44px minimum
- [ ] Forms don't zoom on focus
- [ ] Hamburger menu works
- [ ] Calendar scrollable
- [ ] No horizontal scroll

### Accessibility
- [ ] All images have alt text
- [ ] Forms have labels
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast 4.5:1 minimum
- [ ] Screen reader tested

---

## Performance Targets

- Lighthouse Score: 90+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Bundle size: < 300KB gzipped

---

## Next Steps

1. Review this spec with team
2. Create Figma designs (optional)
3. Start with Phase 1 components
4. Build component library first
5. Implement pages systematically
6. Test each page on mobile
7. Deploy to staging
8. User testing
9. Deploy to production

---

**Document Version:** 1.0
**Last Updated:** 2026-06-29
**Status:** Ready for Implementation
