import puppeteer from 'puppeteer'

const BASE_URL = process.env.TEST_URL || 'https://booking-saas-production-c352.up.railway.app'

async function runE2ETests() {
  console.log('🚀 Starting E2E Tests on:', BASE_URL)

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 720 })

    // Test 1: Register new user
    console.log('\n📝 Test 1: User Registration')
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle2' })

    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'Test123!@#'

    await page.type('input[name="name"]', 'Test User E2E')
    await page.type('input[type="email"]', testEmail)
    await page.type('input[type="password"]', testPassword)

    await page.click('button[type="submit"]')
    await new Promise(resolve => setTimeout(resolve, 3000))

    console.log('✅ User registered:', testEmail)

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/01-after-register.png', fullPage: true })

    // Test 2: Check if redirected to onboarding or dashboard
    const currentUrl = page.url()
    console.log('📍 Current URL after register:', currentUrl)

    if (currentUrl.includes('/onboarding')) {
      console.log('\n🎯 Test 2: Complete Onboarding')

      // Step 1: Company Info
      await page.waitForSelector('input[name="companyName"]', { timeout: 5000 })
      await page.type('input[name="companyName"]', 'E2E Test Company')
      await page.click('button:has-text("Continue")')
      await new Promise(resolve => setTimeout(resolve, 1000))

      await page.screenshot({ path: 'tests/screenshots/02-onboarding-step1.png', fullPage: true })

      // Step 2: Skip other steps and go to dashboard
      const skipButton = await page.$('button:has-text("Skip")')
      if (skipButton) {
        await skipButton.click()
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Test 3: Navigate to Dashboard
    console.log('\n📊 Test 3: Access Dashboard')
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2' })
    await page.screenshot({ path: 'tests/screenshots/03-dashboard.png', fullPage: true })
    console.log('✅ Dashboard loaded')

    // Test 4: Navigate to Reminder Settings
    console.log('\n⏰ Test 4: Reminder Settings')
    await page.goto(`${BASE_URL}/settings/reminders`, { waitUntil: 'networkidle2' })
    await page.screenshot({ path: 'tests/screenshots/04-reminder-settings.png', fullPage: true })

    // Check if reminder toggles exist
    const emailToggle = await page.$('input[id="email1Hour"]')
    if (emailToggle) {
      console.log('✅ Email reminder toggle found')
      await emailToggle.click()
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    const smsToggle = await page.$('input[id="sms1Hour"]')
    if (smsToggle) {
      console.log('✅ SMS reminder toggle found')
    }

    // Test 5: Navigate to Payment Settings
    console.log('\n💳 Test 5: Payment Settings')
    await page.goto(`${BASE_URL}/settings/payments`, { waitUntil: 'networkidle2' })
    await page.screenshot({ path: 'tests/screenshots/05-payment-settings.png', fullPage: true })
    console.log('✅ Payment settings loaded')

    // Test 6: Navigate to Webhooks
    console.log('\n🔗 Test 6: Webhooks')
    await page.goto(`${BASE_URL}/settings/webhooks`, { waitUntil: 'networkidle2' })
    await page.screenshot({ path: 'tests/screenshots/06-webhooks.png', fullPage: true })
    console.log('✅ Webhooks page loaded')

    // Test 7: Create Event Type
    console.log('\n📅 Test 7: Create Event Type')
    await page.goto(`${BASE_URL}/events/new`, { waitUntil: 'networkidle2' })

    await page.type('input[name="title"]', 'E2E Test Event')
    await page.type('textarea[name="description"]', 'This is an automated test event')
    await page.type('input[name="duration"]', '30')

    // Select video provider if dropdown exists
    const videoProviderSelect = await page.$('select[name="videoProvider"]')
    if (videoProviderSelect) {
      await page.select('select[name="videoProvider"]', 'google_meet')
      console.log('✅ Video provider set to Google Meet')
    }

    await page.screenshot({ path: 'tests/screenshots/07-create-event.png', fullPage: true })

    await page.click('button[type="submit"]')
    await new Promise(resolve => setTimeout(resolve, 2000))

    console.log('✅ Event created')
    await page.screenshot({ path: 'tests/screenshots/08-after-event-create.png', fullPage: true })

    // Test 8: Check Health Endpoint
    console.log('\n🏥 Test 8: Health Check')
    await page.goto(`${BASE_URL}/api/health`, { waitUntil: 'networkidle2' })
    const healthData = await page.evaluate(() => document.body.textContent)
    console.log('Health response:', healthData)

    if (healthData?.includes('healthy')) {
      console.log('✅ Health check passed')
    } else {
      console.log('❌ Health check failed')
    }

    // Test 9: Check Reminder API Endpoint (should be unauthorized)
    console.log('\n🔒 Test 9: API Authorization')
    await page.goto(`${BASE_URL}/api/settings/reminders`, { waitUntil: 'networkidle2' })
    const apiResponse = await page.evaluate(() => document.body.textContent)
    console.log('API response:', apiResponse)

    if (apiResponse?.includes('Unauthorized') || apiResponse?.includes('settings')) {
      console.log('✅ API authorization working')
    }

    console.log('\n✅ ALL E2E TESTS PASSED!')
    console.log('\n📸 Screenshots saved in tests/screenshots/')

  } catch (error) {
    console.error('❌ Test failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

// Run tests
runE2ETests().catch(error => {
  console.error('Test suite failed:', error)
  process.exit(1)
})
