# 🚀 Deployment - Nächste Schritte

## ✅ Was bereits erledigt ist:

- ✅ Git Repository initialisiert
- ✅ Initial Commit erstellt (79 Files, 19,487 Zeilen Code)
- ✅ Railway CLI installiert
- ✅ Alle Deployment-Konfigurationen erstellt

---

## 📋 Nächste Schritte (2 Optionen):

### **Option 1: GitHub + Railway (EMPFOHLEN)**

#### 1. GitHub Repository erstellen

```bash
# Via GitHub CLI (falls installiert)
cd /mnt/e/CodelocalLLM/booking-saas
gh repo create booking-saas --public --source=. --remote=origin --push

# ODER manuell via GitHub Web:
# 1. Gehe zu github.com/new
# 2. Repository Name: booking-saas
# 3. Public
# 4. NICHT mit README initialisieren
# 5. Create Repository
```

#### 2. Remote hinzufügen & pushen

```bash
cd /mnt/e/CodelocalLLM/booking-saas

# Ersetze USERNAME mit deinem GitHub Username
git remote add origin https://github.com/USERNAME/booking-saas.git

# Push to GitHub
git push -u origin master
```

#### 3. Railway Projekt erstellen

```bash
# Railway Login
railway login

# Mit GitHub Repository verbinden
railway init

# Wähle: "Create new project"
# Wähle: "Deploy from GitHub repo"
# Wähle dein Repository: USERNAME/booking-saas
```

---

### **Option 2: Direktes Railway Deployment (Schneller)**

```bash
cd /mnt/e/CodelocalLLM/booking-saas

# Railway Login
railway login

# Neues Projekt erstellen
railway init

# Deployment starten
railway up
```

---

## 🗄️ PostgreSQL Database hinzufügen

**Nach Railway Init:**

```bash
# Via CLI
railway add postgresql

# Oder via Railway Dashboard:
# 1. Gehe zu railway.app/project/DEIN-PROJEKT
# 2. Klick "+ New"
# 3. Wähle "Database" → "PostgreSQL"
# 4. DATABASE_URL wird automatisch gesetzt
```

---

## ⚙️ Environment Variables setzen

### Methode 1: Railway Dashboard (Einfacher)

1. Gehe zu railway.app/project/DEIN-PROJEKT
2. Wähle dein Service (nicht die Datenbank)
3. Tab "Variables"
4. Füge hinzu:

```env
NEXTAUTH_SECRET=<generiere mit: openssl rand -base64 32>
NEXTAUTH_URL=https://booking.dabrock.ai
NEXT_PUBLIC_APP_URL=https://booking.dabrock.ai

# Google OAuth (für Login) - siehe unten wie man die bekommt
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# Google Calendar API - siehe unten
GOOGLE_CALENDAR_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=GOCSPX-xxx
```

### Methode 2: Railway CLI

```bash
# NEXTAUTH_SECRET generieren
export NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "NEXTAUTH_SECRET: $NEXTAUTH_SECRET"

# Variables setzen
railway variables set NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
railway variables set NEXTAUTH_URL="https://booking.dabrock.ai"
railway variables set NEXT_PUBLIC_APP_URL="https://booking.dabrock.ai"

# Google Credentials (nach dem Setup - siehe unten)
railway variables set GOOGLE_CLIENT_ID="your-id"
railway variables set GOOGLE_CLIENT_SECRET="your-secret"
railway variables set GOOGLE_CALENDAR_CLIENT_ID="your-calendar-id"
railway variables set GOOGLE_CALENDAR_CLIENT_SECRET="your-calendar-secret"
```

---

## 🔑 Google API Credentials erstellen

### Google OAuth (für User Login):

1. **Google Cloud Console:** https://console.cloud.google.com
2. Neues Projekt: "MyBooking Production"
3. **APIs & Services → OAuth consent screen:**
   - User Type: **External**
   - App name: **MyBooking**
   - Support email: deine Email
   - Authorized domains: `dabrock.ai`
   - Scopes: email, profile, openid
   - Save

4. **Credentials → Create Credentials → OAuth Client ID:**
   - Application type: **Web application**
   - Name: **MyBooking NextAuth**
   - Authorized JavaScript origins:
     - `https://booking.dabrock.ai`
   - Authorized redirect URIs:
     - `https://booking.dabrock.ai/api/auth/callback/google`
   - Create

5. **Kopiere Client ID & Secret** → Railway Variables

### Google Calendar API:

1. **APIs & Services → Library**
2. Suche: "Google Calendar API"
3. Click **Enable**

4. **Credentials → Create Credentials → OAuth Client ID:**
   - Application type: **Web application**
   - Name: **MyBooking Calendar Integration**
   - Authorized redirect URIs:
     - `https://booking.dabrock.ai/api/google/calendar/callback`
   - Create

5. **Kopiere Client ID & Secret** → Railway Variables

---

## 🌐 Custom Domain Setup

### 1. In Railway Dashboard:

1. Gehe zu deinem Service
2. **Settings → Networking → Custom Domain**
3. Eingeben: `booking.dabrock.ai`
4. Railway zeigt CNAME Target: `xyz.railway.app`

### 2. DNS konfigurieren (Cloudflare):

**Login zu Cloudflare → dabrock.ai → DNS:**

```
Type: CNAME
Name: booking
Target: <railway-cname-target>  # z.B. xyz.railway.app
Proxy status: Proxied (Orange Cloud) ✅
TTL: Auto
```

**Speichern!**

DNS Propagation dauert 5-30 Minuten.

---

## 🗃️ Database Migration

**Nach dem ersten erfolgreichen Deploy:**

```bash
# Via Railway CLI
railway run npx prisma migrate deploy

# Oder via Railway Dashboard:
# 1. Latest Deployment → Logs anschauen
# 2. Build sollte automatisch "npx prisma migrate deploy" ausführen
```

---

## 🎯 Admin User erstellen

**Nach Migration via Railway Console:**

```bash
# Railway Shell öffnen
railway shell

# Node starten
node
```

```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('DeinSicheresPasswort123!', 10);

  const user = await prisma.user.create({
    data: {
      name: 'Michael Dabrock',
      email: 'michael.dabrock@gmail.com',
      password: hashedPassword,
    }
  });

  console.log('✅ Admin user created:', user.email);
}

createAdmin()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
```

---

## ✅ Testen

Nach Deployment:

1. **Website:** https://booking.dabrock.ai
2. **Login:** https://booking.dabrock.ai/auth/signin
3. **Admin Dashboard:** https://booking.dabrock.ai/events
4. **Event erstellen**
5. **Booking Page:** https://booking.dabrock.ai/book/dein-event-slug

---

## 🔍 Monitoring

```bash
# Logs live ansehen
railway logs -f

# Environment Variables prüfen
railway variables

# Database verbinden
railway connect postgresql

# Service Status
railway status
```

---

## 📊 Was passiert beim Deploy:

1. **Build Phase:**
   - `npm ci` (Dependencies installieren)
   - `npx prisma generate` (Prisma Client generieren)
   - `npx prisma migrate deploy` (Database Migration)
   - `npm run build` (Next.js Build)

2. **Start Phase:**
   - `npm run start` (Next.js Production Server)

3. **Health Check:**
   - Railway prüft ob Port erreichbar ist
   - Falls erfolgreich → Deployment live! 🎉

---

## 🚨 Häufige Probleme

### Build schlägt fehl: "Cannot find module"
```bash
# Lösung: Stelle sicher alle Dependencies sind in package.json
npm install
git add package.json package-lock.json
git commit -m "fix: update dependencies"
git push
```

### "NEXTAUTH_SECRET is not set"
```bash
# Lösung: Variable in Railway setzen
openssl rand -base64 32
# Kopiere Output und setze in Railway Variables
```

### OAuth Error: "redirect_uri_mismatch"
```bash
# Lösung: Exakte URL in Google Cloud Console hinzufügen
# https://booking.dabrock.ai/api/auth/callback/google
# Warten 5 Minuten nach Update
```

---

## ✅ Deployment Checklist

**Vor dem Deployment:**
- [x] Git Repository erstellt
- [ ] GitHub Repository erstellt
- [ ] Railway Projekt initialisiert
- [ ] PostgreSQL hinzugefügt
- [ ] Environment Variables gesetzt
- [ ] Google OAuth Credentials erstellt
- [ ] Google Calendar API aktiviert

**Nach dem Deployment:**
- [ ] Domain konfiguriert (DNS)
- [ ] SSL/HTTPS funktioniert
- [ ] Database Migration durchgeführt
- [ ] Admin User erstellt
- [ ] Login funktioniert
- [ ] Event erstellt
- [ ] Booking getestet
- [ ] Google Calendar verbunden

---

**Status: 🟡 BEREIT FÜR MANUELLES DEPLOYMENT**

Wähle eine Option oben und folge den Schritten! 🚀
