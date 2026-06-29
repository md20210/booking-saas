# E2E Testing Suite - Booking SaaS

## Overview

Comprehensive end-to-end testing suite for the Booking SaaS platform using Puppeteer.

## Test Files

### 1. `e2e-complete-setup.ts` - Complete Configuration Test

**Purpose**: Full end-to-end test that simulates a new user setting up the entire platform.

**Test Steps**:
1. ✅ **Register New User** - Create account with email/password
2. ✅ **Configure API Credentials** - Set up Google Calendar, Stripe
3. ✅ **Create Event Type** - Set up 30-min consultation
4. ✅ **Test Booking Widget** - Verify public booking page
5. ✅ **Check Integrations** - Verify Google/Outlook connections
6. ✅ **Mobile Responsive** - Test on mobile viewport

**Output**:
- HTML Report: `tests/results/test1.html`
- Screenshots: `tests/results/screenshots/`
- JSON Report: `tests/results/report-{timestamp}.json`

**Deployment**: Results deployed to https://www.dabrock.ai/test1

### 2. `ui-redesign-test.ts` - UI Component Test

**Purpose**: Validate the professional UI redesign (Phase 1).

**Tests**:
- Homepage (navbar, hero, features)
- Login page (centered card, Google OAuth)
- Register page (name input, terms checkbox)
- Mobile navigation menu

## Running Tests

### Prerequisites

```bash
# Install dependencies
npm install

# Install Puppeteer Chrome
npx puppeteer browsers install chrome
```

### Run Complete Setup Test

```bash
# Test against Railway production
npm run test:e2e

# Or manually:
TEST_URL=https://booking-saas-production-c352.up.railway.app tsx tests/e2e-complete-setup.ts
```

### Run UI Redesign Test

```bash
npm run test:ui

# Or manually:
TEST_URL=https://booking-saas-production-c352.up.railway.app tsx tests/ui-redesign-test.ts
```

## Test Results

### Current Status (2026-06-29)

**Complete Setup Test**: ❌ Failed
- **Issue**: User registration not working on Railway
- **Cause**: Database connection or API endpoint issue
- **Next Steps**: Debug registration API

**UI Redesign Test**: ⏳ Pending

## Test Configuration

### Environment Variables

```bash
TEST_URL=https://booking-saas-production-c352.up.railway.app  # Base URL for testing
```

### Test User

Automatically generated with format:
- Email: `test-{timestamp}@example.com`
- Name: `Test User E2E`
- Password: `TestPassword123!`

## HTML Report Format

The test generates a beautiful HTML report with:

- ✅ Test summary (total, success, failed, duration)
- 📊 Individual test results with status badges
- 📸 Screenshots for each step
- ❌ Error messages for failed steps
- 📱 Mobile-responsive design

## Deployment Workflow

```bash
# 1. Run tests
tsx tests/e2e-complete-setup.ts

# 2. Copy results to dabrock-ai
cp tests/results/test1.html /path/to/dabrock-ai-de/out/test1/index.html

# 3. Deploy
cd /path/to/dabrock-ai-de
./deploy.sh
```

## Architecture

```
tests/
├── e2e-complete-setup.ts     # Main E2E test suite
├── ui-redesign-test.ts        # UI component tests
├── results/                   # Generated test results
│   ├── test1.html            # HTML report
│   ├── report-{ts}.json      # JSON report
│   └── screenshots/          # Test screenshots
└── README.md                  # This file
```

## Test Features

### ✨ Highlights

1. **Screenshot Capture**: Every step captured
2. **Error Handling**: Graceful failure with detailed errors
3. **HTML Reports**: Beautiful, mobile-responsive reports
4. **JSON Reports**: Machine-readable test data
5. **Timing**: Duration tracking for each step
6. **Status Badges**: Visual success/failure indicators

### 🎯 Test Coverage

- [x] User Registration
- [x] Login Flow
- [x] API Configuration
- [x] Event Type Creation
- [x] Booking Widget
- [x] Integrations Page
- [x] Mobile Responsiveness
- [ ] Payment Flow (TODO)
- [ ] Email Reminders (TODO)
- [ ] Video Conference Links (TODO)

## Known Issues

### Issue #1: Registration Fails on Railway

**Status**: 🔴 Critical

**Description**: User registration form submits but doesn't create user or redirect to dashboard.

**Impact**: Cannot complete E2E test flow.

**Potential Causes**:
1. Database connection issue (DATABASE_URL env var)
2. API route `/api/auth/register` not working
3. bcryptjs hashing timeout
4. Prisma client not initialized

**Debug Steps**:
```bash
# Check Railway logs
railway logs

# Test API endpoint directly
curl -X POST https://booking-saas-production-c352.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"Test123!"}'

# Check database connection
railway run prisma db push
```

## Future Enhancements

- [ ] Add Stripe payment flow testing
- [ ] Test email reminder system
- [ ] Test video conference link generation
- [ ] Test webhook functionality
- [ ] Test Google Calendar sync
- [ ] Add performance metrics
- [ ] Add accessibility testing
- [ ] Add cross-browser testing

## Links

- **Test Results**: https://www.dabrock.ai/test1
- **Admin Dashboard**: https://www.dabrock.ai/admin
- **Booking App**: https://booking-saas-production-c352.up.railway.app

## Support

For issues or questions:
1. Check test screenshots in `tests/results/screenshots/`
2. Review JSON report for detailed error messages
3. Check Railway logs for backend issues
4. View HTML report at dabrock.ai/test1

---

**Last Updated**: 2026-06-29
**Status**: 🔴 Registration Issue - Needs Fix
**Next Test Run**: After registration fix deployed
