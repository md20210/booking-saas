# 🚀 Quick Deploy zu Railway

## Automatisches Deployment (empfohlen)

```bash
cd /mnt/e/CodelocalLLM/booking-saas
./deploy-railway.sh
```

Das Script:
- Installiert Railway CLI (falls nötig)
- Initialisiert Railway Projekt
- Setzt alle Environment Variables
- Pushed zu GitHub
- Startet Deployment

---

## Manuelles Deployment

### 1. Railway CLI Setup
```bash
npm i -g @railway/cli
railway login
cd /mnt/e/CodelocalLLM/booking-saas
railway init
```

### 2. PostgreSQL hinzufügen
```bash
railway add postgresql
```

### 3. Environment Variables
```bash
# Generiere Secret
export NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Setze Variables
railway variables set NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
railway variables set NEXTAUTH_URL="https://booking.dabrock.ai"
railway variables set NEXT_PUBLIC_APP_URL="https://booking.dabrock.ai"
railway variables set GOOGLE_CLIENT_ID="your-id"
railway variables set GOOGLE_CLIENT_SECRET="your-secret"
railway variables set GOOGLE_CALENDAR_CLIENT_ID="your-calendar-id"
railway variables set GOOGLE_CALENDAR_CLIENT_SECRET="your-calendar-secret"
```

### 4. Deploy
```bash
git push origin master
```

### 5. Domain Setup

**In Railway Dashboard:**
- Settings → Domains
- Add Custom Domain: `booking.dabrock.ai`

**In Cloudflare:**
```
Type: CNAME
Name: booking
Value: <railway-cname>
Proxy: Enabled
```

### 6. Database Migration
```bash
railway run npx prisma migrate deploy
```

---

## ✅ Verification Checklist

Nach dem Deployment:

```bash
# Check health
curl https://booking.dabrock.ai/api/health

# Check logs
railway logs

# Check environment variables
railway variables

# Connect to database
railway connect postgresql
```

---

## 🔧 Quick Commands

```bash
# Logs ansehen
railway logs -f

# Environment variables anzeigen
railway variables

# Database Console
railway connect postgresql

# Deploy neuer Version
git push origin master

# Rollback
railway rollback
```

---

## 📊 URL Structure nach Deployment

**Admin Dashboard:**
- https://booking.dabrock.ai (Login)
- https://booking.dabrock.ai/events (Event Management)
- https://booking.dabrock.ai/design (Design Customizer)
- https://booking.dabrock.ai/settings/tracking (Google Ads)

**Public Pages:**
- https://booking.dabrock.ai/book/[event-slug]

**API Endpoints:**
- https://booking.dabrock.ai/api/events
- https://booking.dabrock.ai/api/bookings
- https://booking.dabrock.ai/api/slots

**Embed Widget:**
```html
<script src="https://booking.dabrock.ai/embed.js"></script>
```

---

## 🎯 Domain Options

### Option 1: Subdomain (booking.dabrock.ai)
✅ **Einfach**
✅ SSL automatisch
✅ Keine Proxy-Konfiguration

### Option 2: Path (dabrock.ai/booking)
Requires **Cloudflare Worker** oder **Nginx Proxy**

**Cloudflare Worker:**
```javascript
addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/booking')) {
    url.hostname = 'booking.dabrock.ai';
    url.pathname = url.pathname.replace('/booking', '');
    return fetch(new Request(url, event.request));
  }

  return fetch(event.request);
});
```

---

## 🚨 Troubleshooting

**Problem: Build fails**
```bash
# Check build logs
railway logs --deployment <deployment-id>

# Test build locally
npm run build
```

**Problem: Database connection error**
```bash
# Check DATABASE_URL
railway variables | grep DATABASE_URL

# Test connection
railway connect postgresql
\conninfo
```

**Problem: OAuth redirect mismatch**
1. Google Cloud Console
2. Update redirect URI: `https://booking.dabrock.ai/api/auth/callback/google`
3. Wait 5 minutes

---

**Status: ✅ Ready to Deploy!**

Run `./deploy-railway.sh` to start! 🚀
