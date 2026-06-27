#!/bin/bash

echo "🚀 MyBooking Railway Deployment - Quick Start"
echo ""
echo "Schritt 1: GitHub Repository erstellen"
echo "======================================="
echo ""
echo "Optionen:"
echo ""
echo "A) Mit GitHub CLI:"
echo "   gh repo create booking-saas --public --source=. --remote=origin --push"
echo ""
echo "B) Manuell:"
echo "   1. Gehe zu https://github.com/new"
echo "   2. Repository Name: booking-saas"
echo "   3. Public"
echo "   4. Create Repository"
echo "   5. Dann:"
echo ""
echo "      git remote add origin https://github.com/DEIN-USERNAME/booking-saas.git"
echo "      git push -u origin master"
echo ""
read -p "Drücke ENTER wenn GitHub Repo erstellt ist..."

echo ""
echo "Schritt 2: Railway initialisieren"
echo "=================================="
echo ""
railway login
railway init

echo ""
echo "Schritt 3: PostgreSQL hinzufügen"
echo "================================="
echo ""
railway add postgresql

echo ""
echo "Schritt 4: Environment Variables"
echo "================================="
echo ""
echo "Generiere NEXTAUTH_SECRET..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
echo ""

read -p "Domain (z.B. booking.dabrock.ai): " DOMAIN
NEXTAUTH_URL="https://$DOMAIN"

echo ""
echo "Setze Environment Variables..."
railway variables set NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
railway variables set NEXTAUTH_URL="$NEXTAUTH_URL"
railway variables set NEXT_PUBLIC_APP_URL="$NEXTAUTH_URL"

echo ""
echo "⚠️  WICHTIG: Google API Credentials"
echo "====================================="
echo ""
echo "Bitte erstelle jetzt Google OAuth & Calendar Credentials:"
echo ""
echo "1. Gehe zu: https://console.cloud.google.com"
echo "2. Erstelle Projekt: 'MyBooking Production'"
echo "3. OAuth consent screen → External"
echo "4. Credentials → OAuth Client ID (2x erstellen):"
echo ""
echo "   A) NextAuth Login:"
echo "      Redirect URI: $NEXTAUTH_URL/api/auth/callback/google"
echo ""
echo "   B) Calendar Integration:"
echo "      Redirect URI: $NEXTAUTH_URL/api/google/calendar/callback"
echo ""
read -p "Hast du die Credentials? Drücke ENTER..."

read -p "GOOGLE_CLIENT_ID: " GOOGLE_CLIENT_ID
read -p "GOOGLE_CLIENT_SECRET: " GOOGLE_CLIENT_SECRET  
read -p "GOOGLE_CALENDAR_CLIENT_ID: " GOOGLE_CALENDAR_CLIENT_ID
read -p "GOOGLE_CALENDAR_CLIENT_SECRET: " GOOGLE_CALENDAR_CLIENT_SECRET

railway variables set GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID"
railway variables set GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET"
railway variables set GOOGLE_CALENDAR_CLIENT_ID="$GOOGLE_CALENDAR_CLIENT_ID"
railway variables set GOOGLE_CALENDAR_CLIENT_SECRET="$GOOGLE_CALENDAR_CLIENT_SECRET"

echo ""
echo "✅ Alle Variables gesetzt!"
echo ""
echo "Schritt 5: Deployment starten"
echo "=============================="
echo ""
git push

echo ""
echo "🎉 Deployment gestartet!"
echo ""
echo "Nächste Schritte:"
echo "1. Railway Dashboard öffnen: railway open"
echo "2. Custom Domain setzen: $DOMAIN"
echo "3. DNS konfigurieren (CNAME)"
echo "4. Database Migration: railway run npx prisma migrate deploy"
echo "5. Admin User erstellen (siehe DEPLOYMENT_NEXT_STEPS.md)"
echo ""
echo "✅ Fertig! Deine App wird deployed."
