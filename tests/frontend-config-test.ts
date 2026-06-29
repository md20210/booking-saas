#!/usr/bin/env tsx

import puppeteer, { Browser, Page } from 'puppeteer'

const FRONTEND_URL = 'https://www.dabrock.ai/booking-config.html'

async function test() {
  console.log('🧪 Testing Frontend Config Page\n')

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()

  try {
    // Test 1: Page loads
    console.log('1️⃣ Loading page...')
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' })
    const title = await page.title()
    console.log(`   ✅ Page loaded: ${title}\n`)

    // Test 2: All tabs exist
    console.log('2️⃣ Checking tabs...')
    const tabs = await page.$$('.tab')
    console.log(`   ✅ Found ${tabs.length} tabs\n`)

    // Test 3: Form fields exist
    console.log('3️⃣ Checking form fields...')
    const fields = [
      'eventTitle',
      'eventDescription',
      'price',
      'duration',
      'googleClientId',
      'googleClientSecret',
      'googleCalendarId',
      'primaryColor'
    ]

    for (const field of fields) {
      const exists = await page.$(`#${field}`)
      if (exists) {
        console.log(`   ✅ ${field}`)
      } else {
        throw new Error(`Field ${field} not found!`)
      }
    }
    console.log()

    // Test 4: Fill out form
    console.log('4️⃣ Filling out form...')
    await page.type('#eventTitle', 'Test Event')
    await page.type('#googleClientId', 'test-client-id')
    await page.type('#googleClientSecret', 'test-secret')
    console.log('   ✅ Form filled\n')

    // Test 5: Save config
    console.log('5️⃣ Saving config...')
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(
        b => b.textContent?.includes('Alle Einstellungen speichern')
      ) as HTMLButtonElement
      if (btn) btn.click()
    })
    await new Promise(resolve => setTimeout(resolve, 500))

    // Check localStorage
    const saved = await page.evaluate(() => {
      return localStorage.getItem('bookingFullConfig')
    })

    if (saved) {
      const config = JSON.parse(saved)
      console.log(`   ✅ Config saved to localStorage`)
      console.log(`   📦 Keys: ${Object.keys(config).length}`)
      console.log(`   🔑 Google Client ID: ${config.googleClientId}\n`)
    } else {
      throw new Error('Config not saved!')
    }

    // Test 6: Reload and verify persistence
    console.log('6️⃣ Reloading page...')
    await page.reload({ waitUntil: 'networkidle2' })
    await new Promise(resolve => setTimeout(resolve, 1000))

    const reloadedValue = await page.evaluate(() => {
      const el = document.getElementById('googleClientId') as HTMLInputElement
      return el ? el.value : null
    })

    if (reloadedValue === 'test-client-id') {
      console.log(`   ✅ Config persisted after reload\n`)
    } else {
      throw new Error('Config did not persist!')
    }

    console.log('✅ ALL TESTS PASSED!\n')

  } catch (error: any) {
    console.error('❌ TEST FAILED:', error.message)
    process.exit(1)
  } finally {
    await browser.close()
  }
}

test().catch(console.error)
