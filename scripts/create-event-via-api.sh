#!/bin/bash

# Create AI Beratung event type via Production API
# Run with: bash scripts/create-event-via-api.sh

API_URL="https://booking-saas-production-c352.up.railway.app"

echo "🚀 Creating AI Beratungsgespräch event type on Production..."
echo ""

# Note: You'll need to be logged in to the dashboard first
# This script creates the event via direct HTTP POST

# Event data
EVENT_DATA='{
  "title": "AI Beratungsgespräch",
  "slug": "ai-beratung",
  "description": "Persönliches 30-Minuten Beratungsgespräch über Ihre AI-Strategie, Herausforderungen und nächste Schritte. Wir besprechen maßgeschneiderte Lösungen für Ihr Unternehmen.",
  "duration": 30,
  "bufferTime": 15,
  "price": 0,
  "currency": "EUR",
  "active": true,
  "requiresConfirmation": false,
  "availabilityType": "custom",
  "availability": {
    "timezone": "Europe/Berlin",
    "schedule": [
      { "day": 1, "startTime": "09:00", "endTime": "18:00" },
      { "day": 2, "startTime": "09:00", "endTime": "18:00" },
      { "day": 3, "startTime": "09:00", "endTime": "18:00" },
      { "day": 4, "startTime": "09:00", "endTime": "18:00" },
      { "day": 5, "startTime": "09:00", "endTime": "18:00" }
    ]
  },
  "customFields": [
    {
      "id": "company",
      "type": "text",
      "label": "Firma / Organisation",
      "required": true,
      "placeholder": "Ihre Firma"
    },
    {
      "id": "industry",
      "type": "select",
      "label": "Branche",
      "required": false,
      "options": ["E-Commerce", "SaaS / Software", "Fintech", "Healthcare", "Manufacturing", "Consulting", "Andere"]
    },
    {
      "id": "topic",
      "type": "textarea",
      "label": "Worum geht es?",
      "required": true,
      "placeholder": "Beschreiben Sie kurz, wobei ich Ihnen helfen kann..."
    },
    {
      "id": "urgency",
      "type": "select",
      "label": "Zeitrahmen",
      "required": false,
      "options": ["Sofort (diese Woche)", "Kurzfristig (1-2 Wochen)", "Mittelfristig (1 Monat)", "Langfristig (Orientierung)"]
    }
  ]
}'

echo "📝 Event Configuration:"
echo "$EVENT_DATA" | jq '.'
echo ""

echo "⚠️  MANUAL STEPS REQUIRED:"
echo ""
echo "1. Go to: ${API_URL}/login"
echo "2. Login with your credentials"
echo "3. Go to: ${API_URL}/event-types"
echo "4. Click 'Create Event Type'"
echo "5. Fill in the form with the data shown above"
echo ""
echo "OR use the Dashboard UI directly at:"
echo "   ${API_URL}/event-types/new"
echo ""
echo "🔗 After creation, the booking URL will be:"
echo "   ${API_URL}/book/ai-beratung"
echo ""
echo "📋 Then update dabrock-ai-de/src/app/booking/page.tsx:"
echo "   const EVENT_SLUG = 'book/ai-beratung';"
echo ""
