# 🚀 DEPLOY JETZT - 5 Schritte

## 1. GitHub Repo erstellen

```bash
cd /mnt/e/CodelocalLLM/booking-saas

# Option A: Mit gh CLI
gh repo create booking-saas --public --source=. --remote=origin --push

# Option B: Manuell auf github.com/new + dann:
git remote add origin https://github.com/DEIN-USERNAME/booking-saas.git
git push -u origin master
```

---

## 2. Railway Setup

```bash
railway login
railway init          # Wähle: "Empty Project"
railway add postgresql
```

---

## 3. Environment Variables in Railway Dashboard

Gehe zu: **railway.app → Dein Projekt → Variables**

Füge hinzu:
```env
NEXTAUTH_SECRET=<generiere: openssl rand -base64 32>
NEXTAUTH_URL=https://booking.dabrock.ai
NEXT_PUBLIC_APP_URL=https://booking.dabrock.ai
```

---

## 4. Google APIs

**console.cloud.google.com:**
1. Neues Projekt: "MyBooking"
2. OAuth Credentials erstellen (2x)
3. Zu Railway Variables hinzufügen

---

## 5. Deploy!

```bash
git push
```

Fertig in Railway Dashboard ansehen: `railway open`

---

## Nach Deploy:

```bash
# Domain setzen in Railway Dashboard
# DNS: CNAME booking → railway-xxx.railway.app

# Migration:
railway run npx prisma migrate deploy

# Admin User erstellen:
railway shell
# Dann Node Code aus DEPLOYMENT_NEXT_STEPS.md
```

✅ DONE!
