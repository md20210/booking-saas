#!/bin/bash

# ====================================
# Railway Deployment - Booking SaaS
# ====================================

echo "🚀 Railway Deployment für booking-saas"
echo ""

# Schritt 1: Login (Browser öffnet sich)
echo "📌 Schritt 1: Railway Login"
echo "Führe aus: railway login"
echo "Browser öffnet sich → Login mit GitHub (md20210)"
echo ""
read -p "Drücke ENTER wenn Login abgeschlossen ist..."

# Schritt 2: Projekt erstellen
echo ""
echo "📌 Schritt 2: Railway Projekt erstellen"
railway init

# Schritt 3: PostgreSQL hinzufügen
echo ""
echo "📌 Schritt 3: PostgreSQL Database hinzufügen"
railway add

# Schritt 4: Environment Variables
echo ""
echo "📌 Schritt 4: Environment Variables"
echo ""
echo "Generiere NEXTAUTH_SECRET..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "✅ Generated: $NEXTAUTH_SECRET"
echo ""

railway variables set NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
railway variables set NEXTAUTH_URL="https://booking.dabrock.ai"
railway variables set NEXT_PUBLIC_APP_URL="https://booking.dabrock.ai"

echo ""
echo "📌 Google OAuth Credentials eingeben:"
read -p "GOOGLE_CLIENT_ID: " GOOGLE_CLIENT_ID
read -p "GOOGLE_CLIENT_SECRET: " GOOGLE_CLIENT_SECRET
read -p "GOOGLE_CALENDAR_CLIENT_ID: " GOOGLE_CALENDAR_ID
read -p "GOOGLE_CALENDAR_CLIENT_SECRET: " GOOGLE_CALENDAR_SECRET

railway variables set GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID"
railway variables set GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET"
railway variables set GOOGLE_CALENDAR_CLIENT_ID="$GOOGLE_CALENDAR_ID"
railway variables set GOOGLE_CALENDAR_CLIENT_SECRET="$GOOGLE_CALENDAR_SECRET"

# Schritt 5: Deploy!
echo ""
echo "📌 Schritt 5: Deploy starten"
railway up

echo ""
echo "✅ DEPLOYMENT GESTARTET!"
echo ""
echo "📊 Nächste Schritte:"
echo "1. Railway Dashboard öffnen: railway open"
echo "2. Custom Domain setzen: booking.dabrock.ai"
echo "3. Migration ausführen: railway run npx prisma migrate deploy"
echo "4. Admin User erstellen (siehe DEPLOY_STATUS.md)"
echo ""
