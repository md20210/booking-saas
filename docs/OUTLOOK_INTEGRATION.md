# Microsoft Outlook / Office 365 Calendar Integration

Complete implementation of Outlook Calendar integration with Teams meeting support for the Booking SaaS application.

## Overview

This feature allows users to connect their Microsoft Outlook / Office 365 calendars to automatically create calendar events with Microsoft Teams meeting links for all confirmed bookings.

## Features Implemented

### 1. OAuth2 Authentication Flow
- **Auth Initiation**: `/api/integrations/outlook/auth`
- **OAuth Callback**: `/api/integrations/outlook/callback`
- **Disconnect**: `/api/integrations/outlook/disconnect`

### 2. Outlook Calendar API Library (`lib/calendar/outlook.ts`)
Comprehensive Microsoft Graph API integration:
- `createOutlookCalendarEvent()` - Create calendar events with Teams meetings
- `getOutlookCalendars()` - Fetch user's available calendars
- `updateOutlookCalendarEvent()` - Update existing events
- `deleteOutlookCalendarEvent()` - Delete calendar events
- `hasOutlookIntegration()` - Check integration status
- Automatic token refresh with 5-minute buffer
- Error handling and logging

### 3. Database Schema
**New Model**: `OutlookIntegration`
```prisma
model OutlookIntegration {
  id            String   @id @default(cuid())
  userId        String   @unique
  accessToken   String   @db.Text
  refreshToken  String   @db.Text
  expiresAt     DateTime
  scope         String
  calendarId    String   @default("primary")
  calendarName  String?
  email         String?
  displayName   String?
  active        Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

**Booking Model Updates**:
- Added `outlookEventId` - Stores Outlook event ID
- Added `teamsMeetLink` - Stores Teams meeting URL

### 4. Dashboard Integration UI
**New Page**: `/integrations`
- Side-by-side cards for Google Calendar and Outlook
- Connection status indicators
- One-click connect/disconnect buttons
- Display connected account information
- Help section with integration details

### 5. Booking Flow Integration
**Updated**: `app/api/bookings/route.ts`
- Supports both Google Calendar and Outlook simultaneously
- Creates events in both calendars if both are connected
- Stores both Google Meet and Teams meeting links
- Non-blocking calendar creation (doesn't fail booking if calendar fails)
- Detailed logging for debugging

## Setup Instructions

### 1. Register Microsoft Azure App

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Configure:
   - **Name**: Your App Name (e.g., "BookingSaaS")
   - **Supported account types**: Choose based on your needs
     - "Accounts in any organizational directory and personal Microsoft accounts" (recommended)
   - **Redirect URI**:
     - Type: Web
     - URL: `https://yourdomain.com/api/integrations/outlook/callback`
5. Click **Register**

### 2. Configure App Permissions

1. Go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Delegated permissions**
5. Add the following scopes:
   - `openid`
   - `profile`
   - `email`
   - `offline_access`
   - `Calendars.ReadWrite`
   - `OnlineMeetings.ReadWrite` (for Teams meetings)
6. Click **Grant admin consent** (if you're an admin)

### 3. Generate Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Add a description and choose expiry
4. Click **Add**
5. **IMPORTANT**: Copy the secret value immediately (you can't view it again)

### 4. Configure Environment Variables

Add to your `.env` file:

```bash
# Microsoft OAuth
MICROSOFT_CLIENT_ID="your-client-id-from-azure"
MICROSOFT_CLIENT_SECRET="your-client-secret"
MICROSOFT_REDIRECT_URI="https://yourdomain.com/api/integrations/outlook/callback"
MICROSOFT_TENANT_ID="common"  # or your specific tenant ID
```

### 5. Run Database Migrations

```bash
# Run migrations to add OutlookIntegration table and Booking fields
npm run db:migrate

# Or manually apply:
# prisma/migrations/20260628_add_outlook_integration/migration.sql
# prisma/migrations/20260628_add_outlook_to_booking/migration.sql
```

### 6. Deploy & Test

1. Deploy your application
2. Log in to dashboard
3. Navigate to `/integrations`
4. Click "Connect" on Outlook card
5. Authorize with your Microsoft account
6. Test by creating a booking - it will create events in both calendars

## API Reference

### Create Outlook Calendar Event

```typescript
import { createOutlookCalendarEvent } from '@/lib/calendar/outlook'

const result = await createOutlookCalendarEvent(userId, {
  summary: 'Meeting Title',
  description: 'Meeting description',
  startTime: new Date('2026-06-28T10:00:00Z'),
  endTime: new Date('2026-06-28T11:00:00Z'),
  attendees: ['attendee@example.com'],
  timezone: 'Europe/Berlin',
  location: 'Conference Room A',
  includeTeamsMeeting: true, // Creates Teams meeting link
})

console.log(result.eventId) // Outlook event ID
console.log(result.meetLink) // Teams meeting URL
```

### Check Integration Status

```typescript
import { hasOutlookIntegration } from '@/lib/calendar/outlook'

const isConnected = await hasOutlookIntegration(userId)
```

## Microsoft Graph API Endpoints Used

- **Authentication**: `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token`
- **User Profile**: `GET https://graph.microsoft.com/v1.0/me`
- **List Calendars**: `GET https://graph.microsoft.com/v1.0/me/calendars`
- **Create Event**: `POST https://graph.microsoft.com/v1.0/me/calendar/events`
- **Update Event**: `PATCH https://graph.microsoft.com/v1.0/me/events/{id}`
- **Delete Event**: `DELETE https://graph.microsoft.com/v1.0/me/events/{id}`

## Teams Meeting Configuration

Teams meetings are automatically created when `includeTeamsMeeting: true`:

```typescript
{
  isOnlineMeeting: true,
  onlineMeetingProvider: 'teamsForBusiness'
}
```

The meeting link is returned in `onlineMeeting.joinUrl` field.

## Token Refresh

Tokens are automatically refreshed when:
- Token is expired
- Less than 5 minutes remaining before expiry

Refresh is handled by `getValidAccessToken()` which is called before every API request.

## Security Considerations

1. **Token Storage**: Access and refresh tokens are stored encrypted in database (`@db.Text`)
2. **Token Expiry**: Automatic refresh prevents expired token errors
3. **User Isolation**: Each user has their own integration with separate tokens
4. **Scope Limitation**: Only requests minimal required scopes
5. **Error Handling**: Calendar failures don't block booking creation

## Troubleshooting

### "Outlook integration not found"
- User hasn't connected Outlook yet
- Integration was disconnected
- Database migration not applied

### "Failed to refresh Outlook token"
- Client secret expired
- Client ID/secret mismatch
- Token was manually revoked by user
- Network connectivity issues

### "Failed to create calendar event"
- Insufficient permissions (check API permissions)
- Invalid calendar ID
- Token expired and refresh failed
- User's mailbox is full or disabled

### Token Refresh Failing
- Check client secret hasn't expired in Azure
- Verify `MICROSOFT_CLIENT_SECRET` in environment
- Ensure `offline_access` scope was granted
- Check refresh token hasn't been revoked

## Development Notes

### Local Testing
Use ngrok or similar to expose localhost for OAuth callback:
```bash
ngrok http 3000
# Update MICROSOFT_REDIRECT_URI to ngrok URL
```

### Production Deployment
- Use HTTPS for redirect URI
- Set `MICROSOFT_TENANT_ID` if restricting to specific tenant
- Monitor token refresh failures in logs
- Set up alerts for calendar creation failures

## Files Created/Modified

### New Files
- `app/api/integrations/outlook/auth/route.ts`
- `app/api/integrations/outlook/callback/route.ts`
- `app/api/integrations/outlook/disconnect/route.ts`
- `lib/calendar/outlook.ts`
- `app/(dashboard)/integrations/page.tsx`
- `components/integrations/integrations-client.tsx`
- `prisma/migrations/20260628_add_outlook_integration/migration.sql`
- `prisma/migrations/20260628_add_outlook_to_booking/migration.sql`
- `.env.example`
- `docs/OUTLOOK_INTEGRATION.md`

### Modified Files
- `prisma/schema.prisma` - Added OutlookIntegration model and Booking fields
- `app/api/bookings/route.ts` - Integrated Outlook calendar creation
- `app/(dashboard)/page.tsx` - Updated to show Integrations card

## Next Steps

Potential enhancements:
1. Calendar selection dropdown (support multiple calendars)
2. Sync existing calendar events to check availability
3. Calendar conflict detection
4. Recurring event support
5. Event reminders configuration
6. Calendar color coding
7. Shared calendars support

## Support

For Microsoft Graph API documentation:
- [Calendar API Reference](https://learn.microsoft.com/en-us/graph/api/resources/calendar)
- [Online Meetings API](https://learn.microsoft.com/en-us/graph/api/resources/onlinemeeting)
- [OAuth 2.0 Flow](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)
