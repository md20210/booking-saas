# 🚀 Deployment Status

## ✅ Was bereits erledigt ist:

### 1. ✅ GitHub Repository erstellt
- **URL:** https://github.com/md20210/booking-saas
- **Code pushed:** 79 files, master branch
- **Remote:** origin configured

---

## 🔄 JETZT MANUELL: Railway Setup

Da Railway Login einen Browser benötigt, musst du das manuell machen:

### Schritt 1: Railway Login
```bash
cd /mnt/e/CodelocalLLM/booking-saas
railway login
```
→ Browser öffnet sich → Login mit GitHub

---

### Schritt 2: Railway Projekt erstellen

**Option A: Von GitHub deployen (EMPFOHLEN)**
```bash
railway init
# Wähle: "Create new project from GitHub repo"
# Wähle: md20210/booking-saas
```

**Option B: Leeres Projekt**
```bash
railway init
# Wähle: "Empty Project"
# Name: booking-saas
```

---

### Schritt 3: PostgreSQL hinzufügen
```bash
railway add
# Wähle: "PostgreSQL"
```

**ODER via Dashboard:**
1. `railway open` (öffnet Browser)
2. Klick "+ New"
3. Wähle "Database" → "PostgreSQL"

---

### Schritt 4: Environment Variables setzen

**In Railway Dashboard (railway open):**

Gehe zu: **Variables Tab**

Füge hinzu:
```env
NEXTAUTH_SECRET=<siehe unten>
NEXTAUTH_URL=https://booking.dabrock.ai
NEXT_PUBLIC_APP_URL=https://booking.dabrock.ai
GOOGLE_CLIENT_ID=<siehe unten>
GOOGLE_CLIENT_SECRET=<siehe unten>
GOOGLE_CALENDAR_CLIENT_ID=<siehe unten>
GOOGLE_CALENDAR_CLIENT_SECRET=<siehe unten>
```

#### NEXTAUTH_SECRET generieren:
```bash
openssl rand -base64 32
```
Kopiere Output → Railway Variable

#### Google Credentials erstellen:

**Google Cloud Console:** https://console.cloud.google.com

**A) OAuth für Login:**
1. Neues Projekt: "MyBooking Production"
2. APIs & Services → OAuth consent screen → External
3. Credentials → OAuth Client ID → Web application
4. Redirect URI: `https://booking.dabrock.ai/api/auth/callback/google`
5. Kopiere Client ID + Secret → Railway Variables

**B) Calendar API:**
1. APIs & Services → Library → "Google Calendar API" → Enable
2. Credentials → OAuth Client ID → Web application
3. Redirect URI: `https://booking.dabrock.ai/api/google/calendar/callback`
4. Kopiere Client ID + Secret → Railway Variables

---

### Schritt 5: Custom Domain

**In Railway Dashboard:**
1. Settings → Networking → Custom Domain
2. Eingeben: `booking.dabrock.ai`
3. Notiere CNAME Target

**In Cloudflare:**
```
Type: CNAME
Name: booking
Target: <railway-cname>
Proxy: Enabled (Orange Cloud)
```

---

### Schritt 6: Deploy starten

**Deployment startet automatisch nach:**
- GitHub Push (wenn von GitHub repo verlinkt)
- ODER manuell: `railway up`

---

### Schritt 7: Database Migration

**Nach erstem Deploy:**
```bash
railway run npx prisma migrate deploy
```

---

### Schritt 8: Admin User erstellen

```bash
railway shell
node
```

```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('DeinPasswort123!', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Michael Dabrock',
      email: 'michael.dabrock@gmail.com',
      password: hashedPassword,
    }
  });
  console.log('✅ Admin:', user.email);
}

createAdmin().then(() => process.exit(0)).catch(console.error);
```

---

## ✅ Fertig!

**Deine App läuft unter:**
- https://booking.dabrock.ai

**Test:**
1. Login: https://booking.dabrock.ai/auth/signin
2. Dashboard: https://booking.dabrock.ai/events
3. Event erstellen
4. Booking testen: https://booking.dabrock.ai/book/event-slug

---

## 🔍 Monitoring

```bash
# Logs ansehen
railway logs -f

# Status prüfen
railway status

# Dashboard öffnen
railway open

# Variables anzeigen
railway variables
```

---

## 🎯 Quick Commands Reference

```bash
# Railway Login
railway login

# Projekt initialisieren
railway init

# PostgreSQL hinzufügen
railway add

# Variables setzen
railway variables set KEY="value"

# Deploy starten
railway up

# Logs
railway logs -f

# Database Migration
railway run npx prisma migrate deploy

# Shell öffnen
railway shell

# Dashboard öffnen
railway open
```

---

**Status:** 🟡 GitHub ✅ | Railway ⏳ Warte auf Login

**Nächster Schritt:** `railway login` ausführen! 🚀
