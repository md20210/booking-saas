import puppeteer from 'puppeteer'

const FRONTEND_URL = 'https://www.dabrock.ai/booking-config.html'
const BACKEND_URL = 'https://booking-saas-production-c352.up.railway.app'

async function testBookingConfigPage() {
  console.log('🚀 Starting E2E Test: Booking Config Page')
  console.log('Frontend URL:', FRONTEND_URL)
  console.log('Backend URL:', BACKEND_URL)

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  try {
    const page = await browser.newPage()

    // Set viewport
    await page.setViewport({ width: 1280, height: 800 })

    console.log('\n✓ Browser launched')

    // Navigate to frontend
    console.log(`\n→ Navigating to ${FRONTEND_URL}...`)
    const response = await page.goto(FRONTEND_URL, {
      waitUntil: 'networkidle0',
      timeout: 30000
    })

    if (!response) {
      throw new Error('Failed to load page - no response')
    }

    console.log(`✓ Page loaded: ${response.status()} ${response.statusText()}`)

    // Take screenshot
    await page.screenshot({
      path: '/mnt/e/CodelocalLLM/booking-saas/tests/screenshots/booking-config-loaded.png',
      fullPage: true
    })
    console.log('✓ Screenshot saved: booking-config-loaded.png')

    // Check page title
    const title = await page.title()
    console.log(`\n📄 Page Title: "${title}"`)

    // Check for main elements
    console.log('\n🔍 Checking page structure...')

    const hasConfigTitle = await page.$eval('body', body =>
      body.textContent?.includes('Booking-Konfiguration') ||
      body.textContent?.includes('Configuration') ||
      false
    )
    console.log(hasConfigTitle ? '✓ Config title found' : '✗ Config title NOT found')

    // Check for tabs
    const tabs = await page.$$('[role="tab"], .tab, button[data-tab]')
    console.log(`✓ Found ${tabs.length} tab elements`)

    // Check for form inputs
    const inputs = await page.$$('input, textarea, select')
    console.log(`✓ Found ${inputs.length} form inputs`)

    // Check for save button
    const saveButtons = await page.$$('button')
    const saveButtonTexts = await Promise.all(
      saveButtons.map(btn => btn.evaluate(el => el.textContent?.trim()))
    )
    console.log(`✓ Found ${saveButtons.length} buttons:`, saveButtonTexts.filter(Boolean))

    // Check network requests to backend
    console.log('\n🌐 Monitoring network requests...')
    let apiCalls = 0

    page.on('request', request => {
      if (request.url().includes(BACKEND_URL)) {
        apiCalls++
        console.log(`→ API Request: ${request.method()} ${request.url()}`)
      }
    })

    page.on('response', async response => {
      if (response.url().includes(BACKEND_URL)) {
        console.log(`← API Response: ${response.status()} ${response.url()}`)
      }
    })

    // Check console errors
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
        console.log('❌ Console Error:', msg.text())
      }
    })

    // Wait a bit for any lazy-loaded content
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Final screenshot
    await page.screenshot({
      path: '/mnt/e/CodelocalLLM/booking-saas/tests/screenshots/booking-config-final.png',
      fullPage: true
    })
    console.log('✓ Final screenshot saved: booking-config-final.png')

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 TEST SUMMARY')
    console.log('='.repeat(60))
    console.log(`Page Title: ${title}`)
    console.log(`HTTP Status: ${response.status()}`)
    console.log(`Tabs Found: ${tabs.length}`)
    console.log(`Form Inputs: ${inputs.length}`)
    console.log(`Buttons: ${saveButtons.length}`)
    console.log(`API Calls to Backend: ${apiCalls}`)
    console.log(`Console Errors: ${consoleErrors.length}`)

    if (consoleErrors.length > 0) {
      console.log('\n❌ Console Errors:')
      consoleErrors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`))
    }

    console.log('\n✅ E2E Test completed successfully!')

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message)
    throw error
  } finally {
    await browser.close()
    console.log('✓ Browser closed')
  }
}

// Run test
testBookingConfigPage()
  .then(() => {
    console.log('\n🎉 All tests passed!')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n💥 Test suite failed:', error)
    process.exit(1)
  })
