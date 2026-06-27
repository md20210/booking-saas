# 🚀 JETZT DEPLOYEN - 2 Befehle

## Problem: Railway GitHub Repo nicht sichtbar?
**Lösung:** Direktes Deployment via CLI statt GitHub Integration

---

## Deployment in 2 Schritten:

### 1️⃣ Railway Login (manuell, Browser öffnet sich)
```bash
cd E:\CodelocalLLM\booking-saas
railway login
```
→ Browser öffnet sich → Login mit GitHub (md20210) ✅

---

### 2️⃣ Deploy Script ausführen
```bash
./deploy-to-railway.sh
```

Das Script macht automatisch:
- ✅ Railway Projekt erstellen
- ✅ PostgreSQL hinzufügen
- ✅ Environment Variables setzen
- ✅ Deployment starten

---

## Oder Manuell (5 Befehle):

```bash
cd E:\CodelocalLLM\booking-saas

# 1. Projekt erstellen
railway init
# → Wähle: "Empty Project"
# → Name: booking-saas

# 2. PostgreSQL hinzufügen
railway add
# → Wähle: "PostgreSQL"

# 3. Environment Variables setzen
railway variables set NEXTAUTH_SECRET="$(openssl rand -base64 32)"
railway variables set NEXTAUTH_URL="https://booking.dabrock.ai"
railway variables set NEXT_PUBLIC_APP_URL="https://booking.dabrock.ai"

# 4. Google Credentials (hast du schon von Google Cloud Console)
railway variables set GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
railway variables set GOOGLE_CLIENT_SECRET="GOCSPX-xxx"
railway variables set GOOGLE_CALENDAR_CLIENT_ID="xxx.apps.googleusercontent.com"
railway variables set GOOGLE_CALENDAR_CLIENT_SECRET="GOCSPX-xxx"

# 5. Deploy!
railway up
```

---

## Nach dem Deploy:

```bash
# Dashboard öffnen
railway open

# Custom Domain hinzufügen: booking.dabrock.ai
# (in Railway Dashboard → Settings → Domains)

# Database Migration
railway run npx prisma migrate deploy

# Logs ansehen
railway logs -f
```

---

## 📌 Cloudflare DNS Setup

**Nach Domain-Setup in Railway:**

Cloudflare → dabrock.ai → DNS:
```
Type: CNAME
Name: booking
Target: <railway-url>.railway.app
Proxy: ✅ Enabled (Orange Cloud)
```

---

## ✅ Fertig!

**Live URL:** https://booking.dabrock.ai

**Admin Login:** https://booking.dabrock.ai/auth/signin

**Event erstellen:** https://booking.dabrock.ai/events

---

## 🔧 Google OAuth Credentials noch nicht fertig?

**Google Cloud Console:** https://console.cloud.google.com

### OAuth für Login:
1. Projekt: "MyBooking Production"
2. APIs & Services → Credentials → OAuth Client ID
3. Redirect URI: `https://booking.dabrock.ai/api/auth/callback/google`
4. Kopiere Client ID + Secret → Railway Variables

### Calendar API:
1. APIs & Services → Library → "Google Calendar API" → Enable
2. Credentials → OAuth Client ID
3. Redirect URI: `https://booking.dabrock.ai/api/google/calendar/callback`
4. Kopiere Client ID + Secret → Railway Variables

---

**Start:** `railway login` → `./deploy-to-railway.sh` ✅
