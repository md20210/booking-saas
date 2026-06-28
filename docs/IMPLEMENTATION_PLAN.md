# BookingSaaS WordPress Widget - Implementationsplan

## Übersicht
Vollständiges Booking-Widget für WordPress mit Google Ads Conversion Tracking, Kalender-Integration und anpassbarem Design.

## Anforderungen

### 1. WordPress Integration
- ✅ WordPress Plugin (bereits vorhanden in `/wordpress-plugin/`)
- ⚠️ Muss erweitert werden für neue Features
- Shortcode: `[mybooking event="slug"]`
- Gutenberg Block Support
- Widget für Sidebar

### 2. Server-Side Conversion Tracking
- Google Ads Conversion Tracking (Server-to-Server)
- Enhanced Conversions API
- Google Analytics 4 Events
- Custom Conversion Events

### 3. Kalender-Integration
- ✅ Google Calendar (bereits implementiert)
- ❌ Microsoft Outlook/Office 365 (fehlt)
- iCal Export
- 2-Wege Synchronisation

### 4. Design System
- 10 Design Templates (Calendly-ähnlich)
- Farb-Themes
- Schriftarten-Auswahl
- CSS Custom Properties
- Dark Mode Support

---

## Phase 1: WordPress Plugin Verbesserung (3-5 Tage)

### 1.1 Plugin-Struktur erweitern
**Status:** Basis vorhanden, muss erweitert werden

**Dateien:**
- `wordpress-plugin/mybooking-saas.php` (Haupt-Plugin)
- `wordpress-plugin/admin/settings.php` (Admin-Interface)
- `wordpress-plugin/includes/shortcode.php` (Shortcode-Handler)
- `wordpress-plugin/assets/block.js` (Gutenberg Block)

**Tasks:**
- [ ] Admin-Panel für API-Verbindung zur BookingSaaS
- [ ] API Key Verwaltung
- [ ] Event-Auswahl Dropdown
- [ ] Template-Auswahl Interface
- [ ] Farb-Picker für Custom Branding
- [ ] Schriftarten-Auswahl

**Code-Struktur:**
```php
// wordpress-plugin/
├── mybooking-saas.php          // Main plugin file
├── admin/
│   ├── settings-page.php       // Admin settings UI
│   ├── api-connection.php      // API key management
│   └── template-manager.php    // Template selection
├── includes/
│   ├── shortcode-handler.php   // [mybooking] shortcode
│   ├── gutenberg-block.php     // Block editor support
│   ├── widget.php              // Sidebar widget
│   └── api-client.php          // Communication with BookingSaaS
├── assets/
│   ├── css/
│   │   └── admin.css
│   ├── js/
│   │   ├── admin.js
│   │   └── block.js
│   └── templates/              // Design templates
└── readme.txt
```

### 1.2 Gutenberg Block erweitern
**Features:**
- Live Preview im Editor
- Template-Auswahl
- Farb-Picker
- Event-Auswahl

---

## Phase 2: Server-Side Conversion Tracking (2-3 Tage)

### 2.1 Google Ads Conversion API Integration

**Neue Dateien:**
- `lib/conversion-tracking/google-ads.ts`
- `lib/conversion-tracking/enhanced-conversions.ts`
- `app/api/tracking/conversion/route.ts`

**Features:**
- Server-to-Server Conversion Tracking
- Enhanced Conversions (First-party data)
- Offline Conversion Import
- GCLID Parameter Tracking

**Schema Updates:**
```prisma
model Booking {
  // ... existing fields

  // Tracking Fields
  gclid              String?  // Google Click ID
  fbclid             String?  // Facebook Click ID
  utmSource          String?
  utmMedium          String?
  utmCampaign        String?
  utmContent         String?
  utmTerm            String?

  // Conversion Tracking
  conversionSent     Boolean @default(false)
  conversionValue    Float?
  conversionCurrency String?

  trackingData       Json?    // Additional tracking params
}
```

**API Flow:**
1. Widget erfasst GCLID beim Laden
2. GCLID wird mit Booking gespeichert
3. Nach Booking-Bestätigung: Server-to-Server Call an Google Ads API
4. Enhanced Conversion mit Email/Phone senden

**Code-Beispiel:**
```typescript
// lib/conversion-tracking/google-ads.ts
export async function sendGoogleAdsConversion(booking: Booking, credentials: ApiCredentials) {
  const conversionData = {
    gclid: booking.gclid,
    conversion_action: credentials.googleAdsConversionAction,
    conversion_date_time: booking.createdAt.toISOString(),
    conversion_value: booking.eventType.price || 0,
    currency_code: booking.eventType.currency || 'EUR',
    // Enhanced Conversions
    user_identifiers: [{
      hashed_email: hashEmail(booking.guestEmail),
      hashed_phone_number: booking.guestPhone ? hashPhone(booking.guestPhone) : undefined,
    }]
  }

  const response = await fetch(
    `https://googleads.googleapis.com/v15/customers/${credentials.googleAdsCustomerId}:uploadClickConversions`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.googleAdsAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversions: [conversionData] })
    }
  )

  return response.json()
}
```

### 2.2 Google Analytics 4 Integration
- GA4 Measurement Protocol
- Custom Events (booking_started, booking_completed)
- E-commerce tracking

---

## Phase 3: Microsoft Outlook Integration (2-3 Tage)

### 3.1 Microsoft Graph API Integration

**Neue Dateien:**
- `lib/calendar/outlook.ts`
- `app/api/integrations/outlook/auth/route.ts`
- `app/api/integrations/outlook/callback/route.ts`
- `app/api/integrations/outlook/sync/route.ts`

**Schema Updates:**
```prisma
model Integration {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  provider  String   // "google" | "outlook"

  accessToken     String  @db.Text
  refreshToken    String? @db.Text
  expiresAt       DateTime?

  calendarId      String?
  calendarName    String?

  active          Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([provider])
}
```

**OAuth Flow:**
1. User klickt "Connect Outlook" im Dashboard
2. Redirect zu Microsoft OAuth
3. Callback speichert Access/Refresh Token
4. Bei Booking: Event wird in Outlook Calendar erstellt

**Code-Beispiel:**
```typescript
// lib/calendar/outlook.ts
export async function createOutlookEvent(booking: Booking, integration: Integration) {
  const event = {
    subject: booking.eventType.title,
    body: {
      contentType: 'HTML',
      content: `Booking with ${booking.guestName}`
    },
    start: {
      dateTime: booking.startTime.toISOString(),
      timeZone: booking.timezone
    },
    end: {
      dateTime: booking.endTime.toISOString(),
      timeZone: booking.timezone
    },
    attendees: [{
      emailAddress: {
        address: booking.guestEmail,
        name: booking.guestName
      },
      type: 'required'
    }],
    isOnlineMeeting: true,
    onlineMeetingProvider: 'teamsForBusiness'
  }

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/calendars/${integration.calendarId}/events`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${integration.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    }
  )

  return response.json()
}
```

---

## Phase 4: Design System mit 10 Templates (3-4 Tage)

### 4.1 Template System Architektur

**Dateien:**
- `components/widget/templates/` (10 Template-Komponenten)
- `lib/design/templates.ts` (Template-Definitionen)
- `lib/design/theme-engine.ts` (Theme-Engine)
- `app/(dashboard)/design/templates/page.tsx` (Template-Auswahl UI)

### 4.2 Die 10 Templates

**Template-Liste:**
1. **Calendly Classic** - Minimalistische sidebar Navigation
2. **Modern Card** - Card-basiertes Layout mit Schatten
3. **Split Screen** - Links Info, rechts Booking
4. **Gradient Flow** - Gradient backgrounds, moderne Übergänge
5. **Corporate Clean** - Professionelles Business-Design
6. **Vibrant Pop** - Bunte, lebhafte Farben
7. **Dark Mode Pro** - Elegantes dunkles Design
8. **Minimalist Zen** - Ultra-minimal, viel Weißraum
9. **Playful Rounded** - Abgerundete Ecken, spielerisch
10. **Tech Stack** - Developer-freundlich, monospace fonts

### 4.3 Theme Schema

**Schema Update:**
```prisma
model DesignSettings {
  id     String @id @default(cuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Template
  templateId  String @default("calendly-classic")

  // Colors
  primaryColor     String @default("#0066FF")
  secondaryColor   String @default("#00C48C")
  backgroundColor  String @default("#FFFFFF")
  textColor        String @default("#1A1A1A")
  accentColor      String @default("#FF6B6B")

  // Typography
  fontFamily       String @default("Inter")
  fontSize         String @default("16px")
  fontHeading      String @default("Inter")

  // Layout
  borderRadius     String @default("8px")
  spacing          String @default("normal")
  boxShadow        Boolean @default(true)

  // Branding
  logo             String? // URL to logo
  customCSS        String? @db.Text

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 4.4 Template-Implementierung

**Beispiel: Calendly Classic Template**
```typescript
// components/widget/templates/calendly-classic.tsx
export const CalendlyClassicTemplate = ({
  eventType,
  design,
  onBook
}: TemplateProps) => {
  return (
    <div
      className="calendly-classic-widget"
      style={{
        '--primary-color': design.primaryColor,
        '--secondary-color': design.secondaryColor,
        '--bg-color': design.backgroundColor,
        '--text-color': design.textColor,
        '--border-radius': design.borderRadius,
        '--font-family': design.fontFamily,
      } as React.CSSProperties}
    >
      <aside className="sidebar">
        {design.logo && <img src={design.logo} alt="Logo" />}
        <h2>{eventType.title}</h2>
        <div className="event-meta">
          <Clock /> {eventType.duration} min
        </div>
        <p>{eventType.description}</p>
      </aside>

      <main className="booking-area">
        {/* Calendar & Time Selection */}
        <BookingFlow eventType={eventType} onBook={onBook} />
      </main>
    </div>
  )
}
```

### 4.5 Font System

**Unterstützte Schriftarten:**
- System Fonts: Inter, Roboto, Open Sans, Lato, Poppins
- Serif: Merriweather, Playfair Display, Lora
- Monospace: Fira Code, JetBrains Mono
- Custom: Google Fonts API Integration

**Code:**
```typescript
// lib/design/fonts.ts
export const AVAILABLE_FONTS = [
  { id: 'inter', name: 'Inter', category: 'sans-serif', url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700' },
  { id: 'roboto', name: 'Roboto', category: 'sans-serif', url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700' },
  { id: 'poppins', name: 'Poppins', category: 'sans-serif', url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700' },
  { id: 'merriweather', name: 'Merriweather', category: 'serif', url: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700' },
  // ... mehr Fonts
]
```

---

## Phase 5: Widget-Engine Verbesserungen (2-3 Tage)

### 5.1 Embed Script erweitern

**Features:**
- Template loading
- Theme injection
- GCLID tracking
- Responsive iframe sizing

**Aktualisierter Embed-Code:**
```javascript
// public/embed.js - erweitert
MyBookingEmbed.prototype.loadWidget = function() {
  // Capture tracking params
  const urlParams = new URLSearchParams(window.location.search)
  const trackingParams = {
    gclid: urlParams.get('gclid'),
    fbclid: urlParams.get('fbclid'),
    utm_source: urlParams.get('utm_source'),
    utm_medium: urlParams.get('utm_medium'),
    utm_campaign: urlParams.get('utm_campaign'),
    utm_content: urlParams.get('utm_content'),
    utm_term: urlParams.get('utm_term'),
  }

  // Build URL with tracking
  const params = new URLSearchParams({
    ...trackingParams,
    template: this.config.template || 'calendly-classic',
    theme: this.config.theme || 'light'
  })

  const url = `${this.config.apiUrl}/book/${this.config.eventSlug}?${params}`

  this.createIframe(url)
}
```

### 5.2 WordPress Shortcode erweitern

```php
// wordpress-plugin/includes/shortcode-handler.php
function mybooking_shortcode($atts) {
  $atts = shortcode_atts([
    'event' => '',
    'template' => 'calendly-classic',
    'height' => '600px',
    'primary_color' => '',
    'font' => ''
  ], $atts);

  $api_url = get_option('mybooking_api_url');
  $tracking_enabled = get_option('mybooking_tracking_enabled');

  // Capture GCLID
  $gclid = isset($_GET['gclid']) ? esc_attr($_GET['gclid']) : '';

  $url = add_query_arg([
    'template' => $atts['template'],
    'gclid' => $gclid,
    'primary_color' => $atts['primary_color'],
    'font' => $atts['font']
  ], $api_url . '/book/' . $atts['event']);

  return sprintf(
    '<iframe src="%s" width="100%%" height="%s" frameborder="0" class="mybooking-widget"></iframe>',
    esc_url($url),
    esc_attr($atts['height'])
  );
}
add_shortcode('mybooking', 'mybooking_shortcode');
```

---

## Phase 6: Dashboard UI für Template-Verwaltung (2 Tage)

### 6.1 Template-Auswahl Interface

**Neue Seiten:**
- `/design/templates` - Template-Galerie
- `/design/customize` - Live-Customizer
- `/design/preview` - Live-Preview

**Features:**
- Thumbnail-Vorschau aller 10 Templates
- Live-Preview mit echten Event-Daten
- Farb-Picker mit Presets
- Font-Selector
- CSS Custom Code Editor

### 6.2 Live Customizer

**UI-Elemente:**
- Split-Screen: Links Controls, rechts Live-Preview
- Color Picker für alle Farben
- Font Dropdown mit Live-Vorschau
- Border Radius Slider
- Spacing Controls
- Save & Publish Button

---

## Phase 7: API Erweiterungen (1-2 Tage)

### 7.1 Neue API Endpoints

**Conversion Tracking:**
```
POST /api/tracking/conversion
- Empfängt Booking ID
- Sendet Conversion an Google Ads
- Sendet Event an GA4
```

**Design API:**
```
GET /api/design/templates
- Liste aller Templates

GET /api/design/settings/:userId
- Design-Einstellungen eines Users

PUT /api/design/settings
- Aktualisiert Design-Einstellungen
```

**Outlook Integration:**
```
GET /api/integrations/outlook/auth
- Initiiert OAuth Flow

GET /api/integrations/outlook/callback
- OAuth Callback

POST /api/integrations/outlook/sync
- Manueller Sync-Trigger
```

---

## Technischer Stack

### Backend
- ✅ Next.js 16.2.9
- ✅ Prisma ORM 5.22.0
- ✅ PostgreSQL
- ❌ Google Ads API SDK (neu)
- ❌ Microsoft Graph SDK (neu)

### Frontend
- ✅ React 18
- ✅ TailwindCSS
- ✅ Shadcn/ui Components
- ❌ CSS Custom Properties für Theming (neu)
- ❌ Template Engine (neu)

### WordPress
- ✅ Plugin Skeleton vorhanden
- ❌ Erweiterte Admin UI (neu)
- ❌ Gutenberg Block (erweitern)

### Tracking
- ❌ Google Ads Conversion API (neu)
- ❌ Google Analytics 4 Measurement Protocol (neu)
- ❌ Enhanced Conversions (neu)

### Kalender
- ✅ Google Calendar API
- ❌ Microsoft Graph API (neu)

---

## Zeitplan & Prioritäten

### Sprint 1 (Woche 1): Core Features
**Priorität: HOCH**
- [ ] Phase 2: Server-Side Conversion Tracking (3 Tage)
- [ ] Phase 3: Outlook Integration (2 Tage)
- [ ] Schema Updates & Migrations (1 Tag)

### Sprint 2 (Woche 2): Design System
**Priorität: HOCH**
- [ ] Phase 4.1-4.3: Template System (2 Tage)
- [ ] Phase 4.4: Erste 5 Templates implementieren (2 Tage)
- [ ] Phase 4.5: Font System (1 Tag)

### Sprint 3 (Woche 3): Templates & UI
**Priorität: MITTEL**
- [ ] Phase 4.4: Restliche 5 Templates (2 Tage)
- [ ] Phase 6: Dashboard Template-Manager (2 Tage)
- [ ] Testing & Refinement (1 Tag)

### Sprint 4 (Woche 4): WordPress & Integration
**Priorität: MITTEL**
- [ ] Phase 1: WordPress Plugin erweitern (3 Tage)
- [ ] Phase 5: Widget-Engine Verbesserungen (2 Tage)

### Sprint 5 (Woche 5): Testing & Polish
**Priorität: HOCH**
- [ ] End-to-End Testing (2 Tage)
- [ ] WordPress Plugin Testing (1 Tag)
- [ ] Conversion Tracking Testing (1 Tag)
- [ ] Dokumentation (1 Tag)

---

## Migrations & Schema Changes

### Migration 1: Tracking Fields
```prisma
-- Add tracking fields to Booking
ALTER TABLE "Booking" ADD COLUMN "gclid" TEXT;
ALTER TABLE "Booking" ADD COLUMN "fbclid" TEXT;
ALTER TABLE "Booking" ADD COLUMN "utmSource" TEXT;
ALTER TABLE "Booking" ADD COLUMN "utmMedium" TEXT;
ALTER TABLE "Booking" ADD COLUMN "utmCampaign" TEXT;
ALTER TABLE "Booking" ADD COLUMN "utmContent" TEXT;
ALTER TABLE "Booking" ADD COLUMN "utmTerm" TEXT;
ALTER TABLE "Booking" ADD COLUMN "conversionSent" BOOLEAN DEFAULT false;
ALTER TABLE "Booking" ADD COLUMN "conversionValue" DOUBLE PRECISION;
ALTER TABLE "Booking" ADD COLUMN "conversionCurrency" TEXT;
ALTER TABLE "Booking" ADD COLUMN "trackingData" JSONB;
```

### Migration 2: Design Settings
```prisma
-- Create DesignSettings table
CREATE TABLE "DesignSettings" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT UNIQUE NOT NULL,
  "templateId" TEXT DEFAULT 'calendly-classic',
  "primaryColor" TEXT DEFAULT '#0066FF',
  "secondaryColor" TEXT DEFAULT '#00C48C',
  "backgroundColor" TEXT DEFAULT '#FFFFFF',
  "textColor" TEXT DEFAULT '#1A1A1A',
  "accentColor" TEXT DEFAULT '#FF6B6B',
  "fontFamily" TEXT DEFAULT 'Inter',
  "fontSize" TEXT DEFAULT '16px',
  "fontHeading" TEXT DEFAULT 'Inter',
  "borderRadius" TEXT DEFAULT '8px',
  "spacing" TEXT DEFAULT 'normal',
  "boxShadow" BOOLEAN DEFAULT true,
  "logo" TEXT,
  "customCSS" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
```

### Migration 3: Integrations
```prisma
-- Create Integration table for multi-provider support
CREATE TABLE "Integration" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "accessToken" TEXT NOT NULL,
  "refreshToken" TEXT,
  "expiresAt" TIMESTAMP,
  "calendarId" TEXT,
  "calendarName" TEXT,
  "active" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX "Integration_userId_idx" ON "Integration"("userId");
CREATE INDEX "Integration_provider_idx" ON "Integration"("provider");
```

### Migration 4: Google Ads Credentials
```prisma
-- Add Google Ads fields to ApiCredentials
ALTER TABLE "ApiCredentials" ADD COLUMN "googleAdsCustomerId" TEXT;
ALTER TABLE "ApiCredentials" ADD COLUMN "googleAdsConversionAction" TEXT;
ALTER TABLE "ApiCredentials" ADD COLUMN "googleAdsConversionLabel" TEXT;
```

---

## Testing-Strategie

### Unit Tests
- Template Rendering
- Theme Engine
- Conversion Tracking Functions
- Calendar Sync Functions

### Integration Tests
- Google Ads API
- Microsoft Graph API
- WordPress Plugin

### E2E Tests
- Kompletter Booking Flow mit Tracking
- Template-Wechsel
- Calendar Sync
- Conversion Tracking Ende-zu-Ende

---

## Dokumentation

### Für Entwickler
- API-Dokumentation
- Template-Entwicklung Guide
- Custom CSS Guide
- WordPress Plugin Setup

### Für Endnutzer
- WordPress Installation Guide
- Template-Auswahl Tutorial
- Conversion Tracking Setup
- Kalender-Integration Setup

---

## Offene Fragen

1. **Google Ads Credentials:** Wie werden Google Ads API Credentials pro User verwaltet?
   - Antwort: Erweitern Sie `ApiCredentials` Tabelle um Google Ads Felder

2. **Template-Lizenzierung:** Sind alle 10 Templates für alle User verfügbar?
   - Empfehlung: Basic = 3 Templates, Pro = alle 10 Templates

3. **Outlook vs. Office 365:** Separate Integration oder gemeinsam?
   - Antwort: Microsoft Graph API unterstützt beides

4. **Custom CSS:** Sicherheit bei User-bereitgestelltem CSS?
   - Empfehlung: CSS Sanitization, nur bestimmte Properties erlauben

---

## Nächste Schritte

### Sofort starten:
1. **Schema Updates** - Prisma Schema erweitern
2. **Migration erstellen** - Neue Tabellen anlegen
3. **Google Ads API Setup** - Service Account erstellen

### Diese Woche:
1. Server-Side Conversion Tracking implementieren
2. Erste 3 Templates entwickeln
3. Outlook Integration starten

### Nächste Woche:
1. Restliche Templates
2. WordPress Plugin erweitern
3. Dashboard UI für Templates

---

**Status-Legende:**
- ✅ Bereits vorhanden
- ❌ Muss neu entwickelt werden
- ⚠️ Vorhanden, muss erweitert werden
