# Quick Start Guide - Calendly Competitor 🚀

## What You Have Now

A **production-ready Calendly alternative** with ALL major features:

### ✅ Complete Feature List

1. **Core Booking System**
   - Event types with custom scheduling
   - Beautiful booking widget with calendar UI
   - Time zone support
   - 11 languages (DE, EN, ES, FR, IT, PT, NL, PL, RU, JA, ZH)

2. **Calendar Integrations**
   - Google Calendar sync + Google Meet links
   - Microsoft Outlook/365 sync + Teams meeting links
   - Automatic event creation

3. **Video Conference**
   - Google Meet (automatic via Calendar API)
   - Microsoft Teams (automatic via Outlook API)
   - Zoom (placeholder - needs OAuth setup)
   - Custom video URLs

4. **Payment Processing**
   - Stripe Checkout integration
   - Multi-currency support (EUR, USD, GBP, CHF, JPY)
   - Automatic booking confirmation after payment
   - Payment webhooks

5. **Reminder System** ⭐ NEW
   - Email reminders (1h, 24h, 1 week before)
   - SMS reminders via Twilio (1h, 24h before)
   - Beautiful HTML email templates
   - Automatic scheduling
   - Cron job for processing

6. **Team Features**
   - Round-robin scheduling with priority weighting
   - Team member management
   - Role-based access

7. **Analytics & Tracking**
   - Google Ads conversion tracking
   - Microsoft Clarity integration
   - Dashboard with charts

8. **Webhooks**
   - Zapier/n8n/Make integration
   - 6 webhook events
   - Secret signing

9. **Self-Service**
   - Customer onboarding wizard
   - API key management
   - White-label branding

## Local Development (3 Steps)

### 1. Install Dependencies
```bash
cd /mnt/e/CodelocalLLM/booking-saas
npm install
```

### 2. Setup Environment
Copy `.env.example` to `.env` and fill in:
```bash
# Minimum required for local dev:
DATABASE_URL="postgresql://user:password@localhost:5432/booking_saas"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Run Database Migration
```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Start Development Server
```bash
npm run dev
```

Open http://localhost:3000 🎉

## Production Deployment (Fastest: Vercel)

### Option 1: Vercel (1-Click Deploy)

```bash
npm install -g vercel
vercel login
vercel --prod
```

Then configure environment variables in Vercel Dashboard.

### Option 2: Railway

```bash
railway login
railway init
railway up
```

### Option 3: Any Node.js Hosting

Build and run:
```bash
npm run build
npm start
```

## Required Environment Variables for Production

See `DEPLOYMENT.md` for complete list. Minimum:

```bash
DATABASE_URL=          # PostgreSQL connection
NEXTAUTH_URL=          # Your domain
NEXTAUTH_SECRET=       # Random secret
GOOGLE_CLIENT_ID=      # Google OAuth
GOOGLE_CLIENT_SECRET=  # Google OAuth
STRIPE_SECRET_KEY=     # Stripe payments
STRIPE_WEBHOOK_SECRET= # Stripe webhooks
RESEND_API_KEY=        # Email reminders
CRON_SECRET=           # Cron job security
```

Optional but recommended:
```bash
TWILIO_ACCOUNT_SID=    # SMS reminders
TWILIO_AUTH_TOKEN=     # SMS reminders
TWILIO_PHONE_NUMBER=   # SMS reminders
```

## Post-Deployment: Setup Cron Job

Your reminders won't send without a cron job calling:
```
POST https://yourdomain.com/api/cron/process-reminders
Header: Authorization: Bearer YOUR_CRON_SECRET
Schedule: Every 10 minutes
```

### Easy Option: cron-job.org
1. Sign up at https://cron-job.org
2. Create new cron job
3. URL: `https://yourdomain.com/api/cron/process-reminders`
4. Schedule: `*/10 * * * *` (every 10 minutes)
5. Add header: `Authorization: Bearer YOUR_CRON_SECRET`

## First Steps After Deployment

1. **Register Account**: Visit /register
2. **Complete Onboarding**: Follow wizard
3. **Connect Google Calendar**: Settings > Integrations
4. **Configure Payments**: Settings > Payments (add Stripe keys)
5. **Configure Reminders**: Settings > Reminders
6. **Create Event Type**: Dashboard > Events > New Event
7. **Share Booking Link**: Copy `/book/[your-event-slug]`

## Testing the Full Flow

1. Create an event type with pricing (e.g., €10)
2. Visit booking page: `/book/your-event-slug`
3. Select time slot and fill in details
4. Click "Proceed to Payment"
5. Use Stripe test card: `4242 4242 4242 4242`
6. Check that:
   - ✅ Booking created
   - ✅ Payment successful
   - ✅ Calendar event created
   - ✅ Meeting link generated
   - ✅ Reminders scheduled
   - ✅ Success page shows details

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│  Public Booking Widget (/book/[slug])      │
│  - Calendar UI                              │
│  - Time slot selection                      │
│  - Payment checkout                         │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  Stripe Checkout                            │
│  - Payment processing                       │
│  - Webhook on success                       │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  Booking Confirmed (webhook handler)        │
│  1. Update booking status                   │
│  2. Create calendar event                   │
│  3. Generate meeting link                   │
│  4. Schedule reminders                      │
│  5. Send conversion tracking                │
│  6. Trigger custom webhooks                 │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  Cron Job (every 10 min)                    │
│  - Process pending reminders                │
│  - Send emails (Resend)                     │
│  - Send SMS (Twilio)                        │
└─────────────────────────────────────────────┘
```

## Key Files to Know

### Backend Logic
- `lib/email/reminder.ts` - Email/SMS reminder system
- `lib/video-conference.ts` - Video meeting links
- `lib/google/calendar.ts` - Google Calendar integration
- `lib/calendar/outlook.ts` - Outlook integration
- `lib/stripe.ts` - Stripe payment client

### API Routes
- `app/api/stripe/checkout/route.ts` - Create payment session
- `app/api/stripe/webhook/route.ts` - Handle payment success
- `app/api/cron/process-reminders/route.ts` - Reminder cron job
- `app/api/settings/reminders/route.ts` - Reminder settings CRUD

### Dashboard Pages
- `app/(dashboard)/settings/reminders/page.tsx` - Reminder UI
- `app/(dashboard)/settings/payments/page.tsx` - Stripe settings
- `app/(dashboard)/settings/webhooks/page.tsx` - Custom webhooks
- `app/(dashboard)/settings/team/page.tsx` - Team scheduling

### Database
- `prisma/schema.prisma` - Full database schema
  - New models: `Reminder`, `ReminderSettings`, `ZoomIntegration`
  - Updated: `Booking` (zoomMeetLink), `EventType` (videoProvider)

## Commits Made (Latest 3)

```
2ba4457 feat: complete video conference + reminder system - Calendly feature parity
1c7c5d0 feat: add complete Stripe payment checkout integration
7cc7c7a feat: add complete UI for payments, webhooks & team management
```

## What's Different from Calendly?

### Better
- ✅ Open source & self-hosted
- ✅ White-label by default (no "Powered by" badge)
- ✅ Full API access included
- ✅ 11 languages built-in
- ✅ Google Ads conversion tracking
- ✅ Per-user API credentials (multi-tenant ready)

### Same
- ✅ All core booking features
- ✅ Calendar sync (Google + Outlook)
- ✅ Video conferencing
- ✅ Payments via Stripe
- ✅ Email + SMS reminders
- ✅ Team scheduling
- ✅ Webhooks

### To Add (Optional)
- ⏳ Zoom OAuth integration (placeholder exists)
- ⏳ Automated confirmation emails
- ⏳ Routing forms
- ⏳ Workflows

## Next Steps

1. **Deploy to production** (see DEPLOYMENT.md)
2. **Set up cron job** for reminders
3. **Configure Stripe** in production mode
4. **Verify domain** with Resend for emails
5. **Test full booking flow**
6. **Share your booking links!**

## Need Help?

- Deployment guide: `DEPLOYMENT.md`
- Database schema: `prisma/schema.prisma`
- API routes: `app/api/*/route.ts`

---

Built with ❤️ using Next.js 15, Prisma, PostgreSQL, Stripe, Resend, and Twilio.

Ready to compete with Calendly? 🚀
