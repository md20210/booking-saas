# Booking SaaS WordPress Plugin

Professionelles WordPress-Plugin zum Einbetten von Booking-Widgets mit 10 verschiedenen Design-Templates, Google Ads Conversion Tracking und Calendar-Integrationen.

## Features

### 🎨 10 Design-Templates

Wähle aus 10 professionellen Design-Templates:

1. **Calendly Classic** - Klassisches Sidebar-Layout
2. **Modern Card** - Glassmorphism & Purple/Pink Gradienten
3. **Split Screen** - 50/50 geteilter Bildschirm
4. **Dark Mode Pro** - Professionelles dunkles Design
5. **Minimalist Zen** - Ultra-clean minimalistisch
6. **Corporate Clean** - Formeller Business-Stil
7. **Vibrant Pop** - Bunte energetische Farben
8. **Gradient Flow** - Emerald/Teal Gradienten
9. **Playful Rounded** - Verspielt mit runden Ecken
10. **Tech Stack** - Developer Terminal-Style

### 📊 Google Ads Conversion Tracking

- Server-seitiges Tracking für maximale Genauigkeit
- GCLID (Google Click ID) Support
- GBRAID / WBRAID (iOS/Android Tracking)
- Enhanced Conversions mit First-Party-Data
- UTM Parameter Attribution

### 📅 Calendar Integrations

- Google Calendar Integration
- Microsoft Outlook / Office 365
- Automatische Google Meet Links
- Automatische Microsoft Teams Links

### ⚡ Performance

- Lazy Loading für Iframes
- Optimierte Bundle Size
- Caching-kompatibel
- Mobile-optimiert

## Installation

### Methode 1: WordPress Admin

1. Lade die ZIP-Datei herunter
2. Gehe zu **WordPress Admin** → **Plugins** → **Neu hinzufügen**
3. Klicke auf **Plugin hochladen**
4. Wähle die ZIP-Datei aus
5. Klicke auf **Jetzt installieren**
6. Aktiviere das Plugin

### Methode 2: FTP Upload

1. Entpacke die ZIP-Datei
2. Lade den Ordner `booking-saas-widget` per FTP nach `/wp-content/plugins/`
3. Aktiviere das Plugin im WordPress Admin

## Konfiguration

### 1. API Einstellungen

Gehe zu **Booking SaaS** → **Settings**:

- **API URL**: Deine Booking SaaS Installation URL
  - Beispiel: `https://booking-saas-production-c352.up.railway.app`
- **API Key** (optional): Für geschützte Event Types

### 2. Event Type erstellen

1. Logge dich in dein Booking SaaS Dashboard ein
2. Erstelle einen neuen Event Type
3. Notiere dir den **Slug** (z.B. `demo-calendly`)

### 3. Widget einbetten

#### Shortcode (Classic Editor)

```
[booking_widget event_slug="demo-calendly" template="modern-card" width="100%" height="800px"]
```

#### Gutenberg Block

1. Füge den "Booking Widget" Block hinzu
2. Konfiguriere Event Slug und Template in der Sidebar
3. Veröffentliche die Seite

## Shortcode Parameter

| Parameter | Beschreibung | Standard | Beispiel |
|-----------|--------------|----------|----------|
| `event_slug` | Event Type Slug (erforderlich) | - | `demo-calendly` |
| `template` | Design-Template | `calendly` | `modern-card` |
| `width` | Breite des Widgets | `100%` | `800px`, `80vw` |
| `height` | Höhe des Widgets | `800px` | `90vh`, `1000px` |

### Beispiele

**Minimalistisches Design:**
```
[booking_widget event_slug="beratung" template="minimalist"]
```

**Corporate mit fester Breite:**
```
[booking_widget event_slug="business-meeting" template="corporate" width="1200px" height="900px"]
```

**Dark Mode für Tech-Unternehmen:**
```
[booking_widget event_slug="tech-support" template="tech"]
```

## Template Übersicht

### Calendly Classic
**Farben:** Blau/Weiß
**Ideal für:** Professionelle Beratung, Standard-Buchungen
**Besonderheiten:** Sidebar-Layout, Links fixiert

### Modern Card
**Farben:** Purple/Pink/Blue Gradienten
**Ideal für:** Moderne Startups, Design Agencies
**Besonderheiten:** Glassmorphism, Progress Steps

### Split Screen
**Farben:** Cyan/Teal
**Ideal für:** Premium Services, Executive Meetings
**Besonderheiten:** 50/50 Layout, Fixed Left Panel

### Dark Mode Pro
**Farben:** Grau/Blau Dark
**Ideal für:** Tech Companies, Night Mode
**Besonderheiten:** Dunkler Hintergrund, Kompakt

### Minimalist Zen
**Farben:** Schwarz/Weiß
**Ideal für:** Design Studios, Architecture
**Besonderheiten:** Ultra-clean, Minimalistische Borders

### Corporate Clean
**Farben:** Dunkelblau
**Ideal für:** B2B Sales, Enterprise
**Besonderheiten:** Formeller Stil, Border-Left Accent

### Vibrant Pop
**Farben:** Pink/Purple/Orange
**Ideal für:** Creative Agencies, Events
**Besonderheiten:** Bunte Gradienten, Emojis

### Gradient Flow
**Farben:** Emerald/Teal/Cyan
**Ideal für:** Design Services, Modern Brands
**Besonderheiten:** Fließende Gradienten, Backdrop Blur

### Playful Rounded
**Farben:** Gelb/Orange
**Ideal für:** Coaches, Freelancer, Communities
**Besonderheiten:** Extrem runde Ecken, Friendly

### Tech Stack
**Farben:** Grün/Schwarz
**Ideal für:** Developer Tools, Tech Startups
**Besonderheiten:** Terminal-Style, Monospace Font

## Google Ads Tracking

### Automatisches Tracking

Das Plugin trackt automatisch:

- **GCLID** - Google Click ID
- **GBRAID** - Google Ads iOS App Tracking
- **WBRAID** - Google Ads Android App Tracking
- **UTM Parameters**:
  - `utm_source`
  - `utm_medium`
  - `utm_campaign`
  - `utm_term`
  - `utm_content`

### Beispiel-URL mit Tracking

```
https://deine-seite.de/termin/?gclid=abc123&utm_source=google&utm_campaign=sommer2024
```

Alle Parameter werden automatisch an das Booking Widget weitergegeben.

### Server-Side Conversion Tracking

Konfiguriere in deinem Booking SaaS Dashboard:

1. Gehe zu **Settings** → **Google Ads**
2. Trage deine Google Ads Credentials ein
3. Aktiviere Conversion Tracking
4. Wähle CONTINUOUS oder BATCH Mode

Conversions werden automatisch an Google Ads gesendet.

## Entwickler-Informationen

### Hooks & Filter

#### Actions

```php
// After widget render
do_action('booking_saas_widget_rendered', $event_slug, $template);
```

#### Filters

```php
// Modify iframe URL
apply_filters('booking_saas_iframe_url', $url, $atts);

// Modify widget container classes
apply_filters('booking_saas_container_class', $classes, $atts);

// Modify default height
apply_filters('booking_saas_default_height', '800px');
```

### JavaScript Events

Das Widget sendet postMessage Events:

```javascript
// Booking completed
{
  type: 'booking-completed',
  bookingId: 'abc123',
  eventType: 'consultation'
}

// Resize request
{
  type: 'booking-widget-resize',
  height: 1200
}
```

### Google Tag Manager Integration

```javascript
window.addEventListener('message', function(event) {
  if (event.data.type === 'booking-completed') {
    dataLayer.push({
      'event': 'booking_completed',
      'booking_id': event.data.bookingId
    });
  }
});
```

## Troubleshooting

### Widget wird nicht angezeigt

**Lösung:**
1. Überprüfe die API URL in den Settings
2. Stelle sicher, dass der Event Slug korrekt ist
3. Deaktiviere Caching temporär zum Testen

### GCLID wird nicht weitergegeben

**Lösung:**
1. Stelle sicher, dass Auto-Tagging in Google Ads aktiviert ist
2. Teste mit `?gclid=test123` in der URL
3. Überprüfe im Network Tab der Browser DevTools

### Iframe ist zu klein/groß

**Lösung:**
- Passe den `height` Parameter an
- Nutze `90vh` für volle Höhe
- Bei Auto-Resize: Aktiviere postMessage Support

### Verschiedene Templates auf einer Seite

**Möglich:** Ja, einfach mehrere Shortcodes mit unterschiedlichen Templates verwenden.

## Performance-Optimierung

### Lazy Loading

Das Plugin nutzt automatisch `loading="lazy"` für Iframes.

### Caching

Kompatibel mit:
- WP Rocket
- W3 Total Cache
- WP Super Cache
- Cloudflare

### CDN

Das Booking SaaS Backend nutzt:
- Railway Edge Network
- Optimierte Assets
- Gzip Compression

## Support & Dokumentation

- **Dokumentation:** https://booking-saas.com/docs
- **Support:** https://booking-saas.com/support
- **Template Galerie:** https://booking-saas.com/templates
- **GitHub:** https://github.com/booking-saas/wordpress-plugin

## Changelog

### Version 1.0.0 (28.06.2026)

**Neue Features:**
- ✅ 10 Design-Templates
- ✅ Shortcode & Gutenberg Block Support
- ✅ Google Ads Conversion Tracking
- ✅ GCLID Auto-Tracking
- ✅ UTM Parameter Support
- ✅ Responsive Design
- ✅ Admin UI mit Template-Vorschau
- ✅ Live Shortcode Generator

## Lizenz

GPL v2 or later

## Credits

Entwickelt von Booking SaaS Team
Copyright © 2026 Booking SaaS
