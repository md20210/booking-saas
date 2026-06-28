/**
 * Script to create "AI Beratungsgespräch" event type for dabrock.ai
 *
 * Run with: tsx scripts/create-ai-beratung-event.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Creating AI Beratungsgespräch event type...\n');

  // First, get or create a user (assuming you have one)
  // You might need to adjust this based on your actual user setup
  let user = await prisma.user.findFirst({
    where: {
      email: 'michael.dabrock@gmail.com'
    }
  });

  if (!user) {
    console.log('📧 Creating user for michael.dabrock@gmail.com...');
    user = await prisma.user.create({
      data: {
        email: 'michael.dabrock@gmail.com',
        name: 'Michael Dabrock',
        emailVerified: new Date(),
      }
    });
    console.log(`✅ User created with ID: ${user.id}\n`);
  } else {
    console.log(`✅ User found with ID: ${user.id}\n`);
  }

  // Check if event already exists
  const existingEvent = await prisma.eventType.findFirst({
    where: {
      slug: 'ai-beratung',
      userId: user.id
    }
  });

  if (existingEvent) {
    console.log('⚠️  Event "ai-beratung" already exists!');
    console.log(`   Event ID: ${existingEvent.id}`);
    console.log(`   URL: https://booking-saas-production-c352.up.railway.app/book/${existingEvent.slug}`);
    return;
  }

  // Create the event type
  const eventType = await prisma.eventType.create({
    data: {
      userId: user.id,
      title: 'AI Beratungsgespräch',
      slug: 'ai-beratung',
      description: 'Persönliches 30-Minuten Beratungsgespräch über Ihre AI-Strategie, Herausforderungen und nächste Schritte. Wir besprechen maßgeschneiderte Lösungen für Ihr Unternehmen.',
      duration: 30,
      price: 0, // Free consultation
      currency: 'EUR',
      active: true,
      requiresConfirmation: false,
      bufferTime: 15, // 15 min buffer between bookings
      availabilityType: 'custom',
      availability: {
        // Monday - Friday, 9 AM - 6 PM (CET)
        timezone: 'Europe/Berlin',
        schedule: [
          { day: 1, startTime: '09:00', endTime: '18:00' }, // Monday
          { day: 2, startTime: '09:00', endTime: '18:00' }, // Tuesday
          { day: 3, startTime: '09:00', endTime: '18:00' }, // Wednesday
          { day: 4, startTime: '09:00', endTime: '18:00' }, // Thursday
          { day: 5, startTime: '09:00', endTime: '18:00' }, // Friday
        ]
      },
      customFields: [
        {
          id: 'company',
          type: 'text',
          label: 'Firma / Organisation',
          required: true,
          placeholder: 'Ihre Firma'
        },
        {
          id: 'industry',
          type: 'select',
          label: 'Branche',
          required: false,
          options: [
            'E-Commerce',
            'SaaS / Software',
            'Fintech',
            'Healthcare',
            'Manufacturing',
            'Consulting',
            'Andere'
          ]
        },
        {
          id: 'topic',
          type: 'textarea',
          label: 'Worum geht es?',
          required: true,
          placeholder: 'Beschreiben Sie kurz, wobei ich Ihnen helfen kann...'
        },
        {
          id: 'urgency',
          type: 'select',
          label: 'Zeitrahmen',
          required: false,
          options: [
            'Sofort (diese Woche)',
            'Kurzfristig (1-2 Wochen)',
            'Mittelfristig (1 Monat)',
            'Langfristig (Orientierung)'
          ]
        }
      ]
    }
  });

  console.log('✅ Event type created successfully!\n');
  console.log('📋 Event Details:');
  console.log(`   Title: ${eventType.title}`);
  console.log(`   Slug: ${eventType.slug}`);
  console.log(`   Duration: ${eventType.duration} minutes`);
  console.log(`   Active: ${eventType.active ? 'Yes' : 'No'}\n`);

  console.log('🔗 Booking URLs:');
  console.log(`   Production: https://booking-saas-production-c352.up.railway.app/book/${eventType.slug}`);
  console.log(`   With Template: https://booking-saas-production-c352.up.railway.app/book/${eventType.slug}?template=modern-card\n`);

  console.log('📝 Next Steps:');
  console.log('   1. Update dabrock-ai-de/src/app/booking/page.tsx:');
  console.log(`      const EVENT_SLUG = '${eventType.slug}';`);
  console.log('   2. Connect Google Calendar in the dashboard');
  console.log('   3. Test the booking flow');
  console.log('   4. Deploy to dabrock.ai\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
