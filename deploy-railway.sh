#!/bin/bash

# ====================================
# Railway Deployment Script
# ====================================

set -e  # Exit on error

echo "🚀 Starting Railway Deployment..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found!"
    echo "Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "🔐 Logging into Railway..."
railway login

# Initialize project if not already done
if [ ! -f "railway.json" ]; then
    echo "📦 Initializing Railway project..."
    railway init
fi

# Link to project (if needed)
echo "🔗 Linking to Railway project..."
railway link

# Add PostgreSQL if not exists
echo "🗄️ Checking for PostgreSQL database..."
railway plugins

# Set environment variables
echo "⚙️ Setting environment variables..."

echo "Please enter your environment variables:"

read -p "NEXTAUTH_SECRET (leave empty to generate): " NEXTAUTH_SECRET
if [ -z "$NEXTAUTH_SECRET" ]; then
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    echo "Generated NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
fi

read -p "Domain (e.g., booking.dabrock.ai): " DOMAIN
NEXTAUTH_URL="https://$DOMAIN"
NEXT_PUBLIC_APP_URL="https://$DOMAIN"

read -p "GOOGLE_CLIENT_ID: " GOOGLE_CLIENT_ID
read -p "GOOGLE_CLIENT_SECRET: " GOOGLE_CLIENT_SECRET
read -p "GOOGLE_CALENDAR_CLIENT_ID: " GOOGLE_CALENDAR_CLIENT_ID
read -p "GOOGLE_CALENDAR_CLIENT_SECRET: " GOOGLE_CALENDAR_CLIENT_SECRET

# Set variables in Railway
railway variables set NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
railway variables set NEXTAUTH_URL="$NEXTAUTH_URL"
railway variables set NEXT_PUBLIC_APP_URL="$NEXT_PUBLIC_APP_URL"
railway variables set GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID"
railway variables set GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET"
railway variables set GOOGLE_CALENDAR_CLIENT_ID="$GOOGLE_CALENDAR_CLIENT_ID"
railway variables set GOOGLE_CALENDAR_CLIENT_SECRET="$GOOGLE_CALENDAR_CLIENT_SECRET"

echo "✅ Environment variables set!"

# Commit changes
echo "📝 Committing Railway configuration..."
git add .
git commit -m "chore: add Railway deployment configuration" || echo "No changes to commit"

# Push to GitHub
echo "⬆️ Pushing to GitHub..."
git push origin master || git push origin main

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "📊 Next steps:"
echo "1. Go to railway.app and check deployment logs"
echo "2. Add PostgreSQL plugin if not already added"
echo "3. Set up custom domain in Railway dashboard"
echo "4. Run database migration: railway run npx prisma migrate deploy"
echo ""
echo "🌐 Your app will be available at: $NEXTAUTH_URL"
echo ""
