# Claude Code - Booking SaaS Projekt Instruktionen

## KRITISCH: Railway CLI Authentifizierung

**BEVOR du an Railway-Deployments arbeitest:**

1. **IMMER zuerst prüfen ob Railway CLI authentifiziert ist:**
   ```bash
   # IN WSL: Verwende Windows CMD Railway CLI!
   cmd.exe /c "railway whoami"
   ```

2. **Falls "Unauthorized":**
   ```bash
   # User muss in Windows CMD einloggen (NICHT WSL!)
   # User führt aus: railway login
   ```
   - User muss sich im Browser einloggen
   - CLI erhält dann Zugriff auf Logs und Deployments
   - **WICHTIG:** Windows Railway CLI und WSL Railway CLI sind GETRENNT!

3. **NIEMALS ohne Railway CLI Zugriff arbeiten:**
   - Ohne Railway CLI kannst du KEINE Logs sehen
   - Ohne Logs kannst du KEINE Deployment-Fehler debuggen
   - Ohne Deployment-Fehler zu sehen, ist alles nur Raten
   - **Das führt zu Stunden verschwendeter Zeit mit falschen "Fixes"**

4. **WSL Railway CLI Problem - GELÖST:**
   ```bash
   # Verwende IMMER Windows CMD Railway via WSL:
   cd /mnt/e/CodelocalLLM/booking-saas
   cmd.exe /c "railway whoami"
   cmd.exe /c "railway logs"
   cmd.exe /c "railway status"
   cmd.exe /c "railway variables"
   ```
   - WSL und Windows Railway CLI teilen KEINE Authentifizierung
   - User loggt sich in Windows CMD ein
   - WSL ruft Windows Railway CLI über cmd.exe auf

## Railway Deployment Workflow

### 1. Vor jedem Deployment-Fix:
```bash
# Check auth (via Windows CMD from WSL)
cmd.exe /c "railway whoami"

# Get latest deployment logs
cmd.exe /c "railway logs"

# Check environment variables
cmd.exe /c "railway variables"
```

### 2. Nach Code-Änderungen:
```bash
# Local build test FIRST
npm run build

# Commit only if build passes
git add . && git commit -m "fix: ..." && git push

# Wait for Railway deployment
sleep 120

# Check deployment logs (via Windows CMD)
cmd.exe /c "railway logs"

# Verify endpoint
curl -I https://booking-saas-production-c352.up.railway.app/api/config
```

### 3. Deployment Failed?
```bash
# Get build logs from Railway (via Windows CMD)
cmd.exe /c "railway logs" | grep -i error

# Check if DATABASE_URL is set
cmd.exe /c "railway variables" | grep DATABASE

# Check service status
cmd.exe /c "railway status"
```

## Niemals:

- ❌ Deployment "fixen" ohne Railway Logs zu checken
- ❌ Behaupten "es sollte jetzt funktionieren" ohne Logs zu sehen
- ❌ Multiple commits pushen in der Hoffnung dass etwas klappt
- ❌ localhost URLs in Production Code
- ❌ Tests in Production builds inkludieren

## Immer:

- ✅ `railway login` am Start der Session
- ✅ `railway logs` vor und nach jedem Fix
- ✅ Lokalen Build testen vor dem Push
- ✅ Railway Environment Variables prüfen
- ✅ User ehrlich sagen wenn du keine Railway-Logs Zugriff hast

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- Prisma 5.22.0 + PostgreSQL (Railway managed)
- NextAuth.js (Session-based auth)
- Railway (Production deployment)
- Puppeteer (E2E tests - NICHT in production build)

## Projekt Struktur

- `/app/api/*` - Next.js API routes
- `/lib/db.ts` - Prisma client
- `/prisma/schema.prisma` - Database schema
- `tests.bak/` - Tests (excluded from build)
- `.env` - Local environment (NICHT für Railway)

## Railway Environment Variables (Production)

Diese müssen auf Railway gesetzt sein:
- `DATABASE_URL` - Railway PostgreSQL URL
- `NEXTAUTH_SECRET` - Auth secret
- `NEXTAUTH_URL` - Production URL
- Google OAuth credentials
- Stripe keys (falls benötigt)
