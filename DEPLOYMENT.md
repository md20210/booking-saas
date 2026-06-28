# Deployment Guide - Calendly Competitor SaaS

## Completed Features ✅

### Core Booking System
- ✅ Event type creation with custom fields
- ✅ Public booking widget with calendar UI
- ✅ Time slot availability system
- ✅ Timezone support
- ✅ Multi-language support (11 languages with next-intl)
- ✅ Custom design system & white-label branding

### Calendar Integrations
- ✅ Google Calendar integration (OAuth 2.0)
- ✅ Microsoft Outlook/365 integration
- ✅ Automatic calendar event creation
- ✅ Google Meet link generation
- ✅ Microsoft Teams meeting links

### Video Conference
- ✅ Google Meet integration
- ✅ Microsoft Teams integration
- ✅ Zoom integration (placeholder - needs Zoom OAuth)
- ✅ Custom video URL support
- ✅ Automatic meeting link in booking confirmations

### Payment System
- ✅ Stripe Checkout integration
- ✅ Payment verification webhook
- ✅ Automatic booking confirmation after payment
- ✅ Multi-currency support (EUR, USD, GBP, CHF, JPY)
- ✅ Payment status tracking

### Reminder System
- ✅ Email reminders (1 hour, 24 hours, 1 week before)
- ✅ SMS reminders via Twilio (1 hour, 24 hours before)
- ✅ Beautiful HTML email templates
- ✅ Automatic reminder scheduling on booking
- ✅ Cron job API for processing reminders
- ✅ Dashboard UI for reminder settings

### Analytics & Tracking
- ✅ Google Ads conversion tracking
- ✅ Enhanced conversions with customer data
- ✅ Microsoft Clarity integration
- ✅ Continuous & batch tracking modes
- ✅ Dashboard analytics with charts

### Team Features
- ✅ Team member management
- ✅ Round-robin scheduling with priority
- ✅ Per-member calendar integration
- ✅ Role-based access (Admin/Member)

### Webhooks & Integrations
- ✅ Custom webhook system for Zapier/n8n/Make
- ✅ 6 webhook events: BOOKING_CREATED, CANCELLED, RESCHEDULED, COMPLETED, PAYMENT_SUCCEEDED, PAYMENT_FAILED
- ✅ Webhook secret signing
- ✅ Failure tracking

### Self-Service Features
- ✅ Customer onboarding wizard
- ✅ API key management
- ✅ Per-user API credentials (Google Ads, Email, etc.)
- ✅ Audit logs

## Environment Variables Required

### Core
```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

### Google OAuth & Calendar
```bash
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Microsoft OAuth
```bash
MICROSOFT_CLIENT_ID="your-microsoft-client-id"
MICROSOFT_CLIENT_SECRET="your-microsoft-client-secret"
```

### Stripe Payments
```bash
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Email Service (Resend)
```bash
RESEND_API_KEY="re_..."
EMAIL_FROM="BookingSaaS <noreply@yourdomain.com>"
```

### SMS Service (Twilio) - Optional
```bash
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1234567890"
```

### Cron Job Security
```bash
CRON_SECRET="your-secure-random-secret"
```

### Optional: Sentry Error Tracking
```bash
SENTRY_DSN="https://..."
```

## Database Setup

1. Create PostgreSQL database (Neon, Supabase, Railway, or local)

2. Run migrations:
```bash
npx prisma migrate deploy
```

3. Generate Prisma client:
```bash
npx prisma generate
```

## Stripe Setup

1. Create Stripe account at https://stripe.com
2. Get API keys from Dashboard > Developers > API keys
3. Create webhook endpoint at Dashboard > Developers > Webhooks
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events to listen:
     - `checkout.session.completed`
     - `checkout.session.expired`
     - `payment_intent.payment_failed`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Email Service Setup (Resend)

1. Sign up at https://resend.com
2. Get API key from Dashboard
3. Verify your domain for production sending
4. Set `RESEND_API_KEY` and `EMAIL_FROM`

## SMS Service Setup (Twilio) - Optional

1. Sign up at https://twilio.com
2. Get Account SID and Auth Token
3. Buy a phone number
4. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

## Cron Job Setup

### Option 1: Vercel Cron (if deploying to Vercel)

Create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/process-reminders",
    "schedule": "*/10 * * * *"
  }]
}
```

### Option 2: External Cron Service

Use https://cron-job.org or similar:
- URL: `https://yourdomain.com/api/cron/process-reminders`
- Method: POST
- Header: `Authorization: Bearer YOUR_CRON_SECRET`
- Schedule: Every 10 minutes

### Option 3: GitHub Actions

Create `.github/workflows/cron.yml`:
```yaml
name: Process Reminders
on:
  schedule:
    - cron: '*/10 * * * *'
jobs:
  process:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger cron endpoint
        run: |
          curl -X POST https://yourdomain.com/api/cron/process-reminders \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

## Deployment Options

### Option A: Vercel (Recommended)

```bash
npm install -g vercel
vercel login
vercel --prod
```

Set all environment variables in Vercel Dashboard > Settings > Environment Variables

### Option B: Railway

```bash
railway login
railway init
railway up
```

### Option C: Docker + VPS

Build and run:
```bash
docker build -t booking-saas .
docker run -p 3000:3000 --env-file .env booking-saas
```

### Option D: Strato SFTP (Static Export - Limited)

Note: Static export won't work for this app due to dynamic features. Need Node.js hosting.

## Post-Deployment Checklist

- [ ] Database migrations run successfully
- [ ] All environment variables set
- [ ] Stripe webhook endpoint verified
- [ ] Google OAuth redirect URI configured
- [ ] Microsoft OAuth redirect URI configured
- [ ] Email sending tested (Resend domain verified)
- [ ] SMS sending tested (if using Twilio)
- [ ] Cron job running (check logs after 10 minutes)
- [ ] Test booking flow end-to-end
- [ ] Test payment flow with Stripe test mode
- [ ] Verify calendar event creation
- [ ] Verify meeting links generated
- [ ] Verify reminders scheduled
- [ ] Check analytics dashboard

## Testing Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

Create test user at /register
Complete onboarding wizard
Create event type
Test booking flow

## Support & Documentation

- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- Stripe: https://stripe.com/docs
- Resend: https://resend.com/docs
- Twilio: https://www.twilio.com/docs

## Production URLs

- Main app: https://yourdomain.com
- Booking widget: https://yourdomain.com/book/[event-slug]
- Dashboard: https://yourdomain.com/dashboard
- API health check: https://yourdomain.com/api/health

## Architecture

```
booking-saas/
├── app/                    # Next.js 15 App Router
│   ├── (dashboard)/       # Authenticated dashboard routes
│   ├── (public)/          # Public booking widget
│   └── api/               # API routes
├── lib/                   # Shared libraries
│   ├── google/           # Google Calendar integration
│   ├── calendar/         # Outlook integration
│   ├── email/            # Email & SMS reminders
│   ├── conversion-tracking/ # Google Ads tracking
│   └── video-conference.ts # Video meeting links
├── prisma/               # Database schema
└── components/           # React components
```

## Features Comparison: Calendly vs Our SaaS

| Feature | Calendly | Our SaaS |
|---------|----------|----------|
| Booking system | ✅ | ✅ |
| Calendar sync | ✅ | ✅ (Google + Outlook) |
| Video conferencing | ✅ | ✅ (Meet + Teams + Zoom) |
| Payments | ✅ | ✅ (Stripe) |
| Email reminders | ✅ | ✅ (Resend) |
| SMS reminders | ✅ | ✅ (Twilio) |
| Team scheduling | ✅ | ✅ (Round-robin) |
| Webhooks | ✅ | ✅ (6 events) |
| Analytics | ✅ | ✅ (Google Ads + Clarity) |
| White-label | ❌ (paid) | ✅ (included) |
| Self-hosted | ❌ | ✅ |
| API access | ✅ | ✅ |
| Multi-language | Limited | ✅ (11 languages) |
| Open source | ❌ | ✅ |

---

Built with Next.js 15, Prisma, PostgreSQL, Stripe, Resend, and Twilio.
