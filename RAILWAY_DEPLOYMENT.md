# Railway Deployment Guide - MyBooking SaaS

## 🚀 Schritt-für-Schritt Deployment auf Railway

### 1. Railway Projekt erstellen

```bash
# Railway CLI installieren (falls noch nicht vorhanden)
npm i -g @railway/cli

# Login
railway login

# Neues Projekt erstellen
cd /mnt/e/CodelocalLLM/booking-saas
railway init
```

**Oder via Web:**
1. Gehe zu https://railway.app
2. "New Project" → "Deploy from GitHub repo"
3. Verbinde dein GitHub Repository

---

### 2. PostgreSQL Datenbank hinzufügen

**In Railway Dashboard:**
1. "New" → "Database" → "PostgreSQL"
2. Warten bis Datenbank läuft
3. DATABASE_URL wird automatisch als Environment Variable gesetzt

---

### 3. Environment Variables konfigurieren

**In Railway Dashboard → Settings → Environment Variables:**

Füge folgende Variables hinzu:

```env
# NextAuth (WICHTIG!)
NEXTAUTH_SECRET=<generiere mit: openssl rand -base64 32>
NEXTAUTH_URL=https://booking.dabrock.ai

# Google OAuth (für User Login)
GOOGLE_CLIENT_ID=<dein-google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<dein-google-oauth-secret>

# Google Calendar API (für Kalender-Integration)
GOOGLE_CALENDAR_CLIENT_ID=<dein-calendar-client-id>
GOOGLE_CALENDAR_CLIENT_SECRET=<dein-calendar-secret>

# App URL (für Redirects)
NEXT_PUBLIC_APP_URL=https://booking.dabrock.ai
```

---

### 4. Google OAuth Credentials erstellen

#### 4a. Google Cloud Console Setup

1. Gehe zu https://console.cloud.google.com
2. Neues Projekt erstellen: "MyBooking Production"
3. API & Services → OAuth consent screen
   - User Type: External
   - App name: MyBooking
   - Support email: deine Email
   - Authorized domains: `dabrock.ai`

4. API & Services → Credentials → Create Credentials → OAuth Client ID
   - Application type: Web application
   - Name: MyBooking NextAuth
   - Authorized redirect URIs:
     - `https://booking.dabrock.ai/api/auth/callback/google`

5. Kopiere Client ID & Secret → Railway Environment Variables

#### 4b. Google Calendar API aktivieren

1. API & Services → Library
2. Suche "Google Calendar API"
3. Klick "Enable"
4. Erstelle neue OAuth Client ID (wie oben):
   - Name: MyBooking Calendar Integration
   - Authorized redirect URIs:
     - `https://booking.dabrock.ai/api/google/calendar/callback`

---

### 5. Custom Domain konfigurieren

#### Option A: Subdomain dabrock.ai/booking (via Proxy)

**Nicht direkt möglich - Railway braucht eigene Subdomain!**

#### Option B: Subdomain booking.dabrock.ai (EMPFOHLEN)

**In Railway:**
1. Settings → Domains
2. "Custom Domain" → `booking.dabrock.ai`
3. Railway zeigt dir CNAME Record

**In DNS (Cloudflare/Provider):**
```
Type: CNAME
Name: booking
Value: <railway-cname-target>
Proxy: Enabled (Orange Cloud bei Cloudflare)
```

**Update Environment Variables:**
```env
NEXTAUTH_URL=https://booking.dabrock.ai
NEXT_PUBLIC_APP_URL=https://booking.dabrock.ai
```

**Update Google OAuth Redirects:**
- `https://booking.dabrock.ai/api/auth/callback/google`
- `https://booking.dabrock.ai/api/google/calendar/callback`

---

### 6. Git Push & Deploy

```bash
# Alle Änderungen committen
git add .
git commit -m "feat: add Railway deployment configuration"

# Push to main branch
git push origin master

# Railway deployed automatisch!
```

---

### 7. Database Migration

Nach dem ersten Deploy:

```bash
# Via Railway CLI
railway run npx prisma migrate deploy

# Oder via Railway Dashboard → Deployments → Latest → Console
npx prisma migrate deploy
```

---

### 8. Erste Admin User erstellen

**Via Railway Console:**

```bash
# Railway CLI
railway run node

# Oder in Railway Dashboard Console
node
```

```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('your-secure-password', 10);

  const user = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'your-email@gmail.com',
      password: hashedPassword,
    }
  });

  console.log('Admin user created:', user);
}

createAdmin()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
```

---

### 9. Test & Verify

1. **Website öffnen:** https://booking.dabrock.ai
2. **Login testen:** https://booking.dabrock.ai/auth/signin
3. **Event erstellen:** Dashboard → Events → Create New Event
4. **Booking testen:** https://booking.dabrock.ai/book/your-event-slug

---

## 🔧 Troubleshooting

### Build Fehler: "Cannot find module 'prisma'"

**Lösung:**
```bash
# Stelle sicher dass Prisma in dependencies ist (nicht devDependencies)
npm install @prisma/client prisma --save
```

### "NEXTAUTH_SECRET is not set"

**Lösung:**
```bash
# Generiere Secret
openssl rand -base64 32

# Füge zu Railway Environment Variables hinzu
NEXTAUTH_SECRET=<generated-secret>
```

### Google OAuth Error: "redirect_uri_mismatch"

**Lösung:**
1. Google Cloud Console → Credentials
2. Bearbeite OAuth Client
3. Füge exakte URL hinzu: `https://booking.dabrock.ai/api/auth/callback/google`
4. Speichern & 5min warten

### Database Connection Error

**Lösung:**
```bash
# Prüfe DATABASE_URL in Railway
railway variables

# Sollte etwa so aussehen:
# postgresql://postgres:xxx@xxx.railway.app:5432/railway
```

---

## 📊 Monitoring & Logs

**Railway Dashboard:**
- Deployments → Logs (Real-time logs)
- Metrics → CPU, Memory, Network

**Logs anschauen:**
```bash
railway logs
```

---

## 🎯 Post-Deployment Checklist

- [ ] Website erreichbar unter https://booking.dabrock.ai
- [ ] Google OAuth Login funktioniert
- [ ] Dashboard lädt korrekt
- [ ] Event Type kann erstellt werden
- [ ] Google Calendar Connection funktioniert
- [ ] Booking Flow funktioniert Ende-zu-Ende
- [ ] Email Notifications (wenn konfiguriert)
- [ ] Embed Widget funktioniert

---

## 🔒 Security Best Practices

1. **Secrets rotieren:**
   - NEXTAUTH_SECRET regelmäßig ändern
   - Google OAuth Credentials rotieren

2. **Rate Limiting:**
   - Railway hat automatisches DDoS Protection
   - Ggf. zusätzlich Cloudflare nutzen

3. **CORS Headers:**
   - Embed Widget nur für erlaubte Domains

4. **Database Backups:**
   - Railway macht automatische Backups
   - Zusätzlich manuell: `pg_dump` via Railway Console

---

## 💰 Kosten (Railway Pricing)

**Starter Plan (FREE):**
- $5 Guthaben/Monat
- Ausreichend für Testing

**Developer Plan ($20/Monat):**
- $20 Guthaben inkl.
- Empfohlen für Production

**Pro Plan ($50/Monat):**
- $50 Guthaben inkl.
- Für höheres Traffic

---

## 🚀 Alternative: dabrock.ai/booking via Reverse Proxy

Falls du **dabrock.ai/booking** statt Subdomain willst:

**Option 1: Cloudflare Worker (Proxy)**
```javascript
// worker.js
addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/booking')) {
    const newUrl = new URL(event.request.url);
    newUrl.hostname = 'booking.dabrock.ai';
    newUrl.pathname = newUrl.pathname.replace('/booking', '');

    return fetch(new Request(newUrl, event.request));
  }

  // Normal dabrock.ai handling
  return fetch(event.request);
});
```

**Option 2: Nginx Reverse Proxy (falls eigener Server)**
```nginx
location /booking {
  proxy_pass https://booking.dabrock.ai;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
}
```

---

**Status: ✅ Deployment Guide komplett**

Nach diesen Schritten läuft dein Booking-System auf Railway! 🎉
