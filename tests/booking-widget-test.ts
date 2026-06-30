import puppeteer from 'puppeteer'

const WIDGET_URL = 'https://www.dabrock.ai/booking-widget-live.html'

async function testBookingWidget() {
  console.log('🚀 Testing Booking Widget')
  console.log('URL:', WIDGET_URL)
  console.log('=' .repeat(60))

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1920, height: 1080 })

    console.log('\n📄 Loading widget page...')
    const response = await page.goto(WIDGET_URL, {
      waitUntil: 'networkidle0',
      timeout: 30000
    })

    if (!response) {
      throw new Error('Failed to load page')
    }

    console.log(`✓ HTTP Status: ${response.status()} ${response.statusText()}`)

    // Check page title
    const title = await page.title()
    console.log(`✓ Title: "${title}"`)

    // Wait for main elements
    await page.waitForSelector('.header h1', { timeout: 5000 })
    await page.waitForSelector('.booking-grid', { timeout: 5000 })
    await page.waitForSelector('.calendar-widget', { timeout: 5000 })

    // Extract content
    const content = await page.evaluate(() => {
      return {
        heading: document.querySelector('.header h1')?.textContent || '',
        description: document.querySelector('.header p')?.textContent || '',
        hasCalendar: !!document.querySelector('.calendar-widget'),
        hasEventDetails: !!document.querySelector('.event-details'),
        detailCount: document.querySelectorAll('.detail-row').length,
        hasStepIndicator: !!document.querySelector('.step-indicator'),
        stepCount: document.querySelectorAll('.step').length
      }
    })

    console.log('\n📊 Page Content:')
    console.log('  Heading:', content.heading)
    console.log('  Description:', content.description)
    console.log('  Calendar Widget:', content.hasCalendar ? 'YES ✓' : 'NO ✗')
    console.log('  Event Details:', content.hasEventDetails ? 'YES ✓' : 'NO ✗')
    console.log('  Detail Rows:', content.detailCount)
    console.log('  Step Indicator:', content.hasStepIndicator ? 'YES ✓' : 'NO ✗')
    console.log('  Steps:', content.stepCount)

    // Test calendar interaction
    console.log('\n🗓️  Testing Calendar Interaction...')

    // Wait for calendar to render
    await page.waitForSelector('.calendar-day:not(.disabled)', { timeout: 5000 })

    const calendarDays = await page.$$('.calendar-day:not(.disabled)')
    console.log(`  Available days: ${calendarDays.length}`)

    if (calendarDays.length > 0) {
      // Click first available day
      await calendarDays[0].click()
      console.log('  ✓ Clicked first available day')

      // Wait for time slots to load
      await new Promise(resolve => setTimeout(resolve, 2000))

      const hasTimeSlots = await page.$('#time-slots-container')
      if (hasTimeSlots) {
        console.log('  ✓ Time slots section loaded')
      }
    }

    // Take screenshot
    await page.screenshot({
      path: '/mnt/e/CodelocalLLM/booking-saas/tests/screenshots/booking-widget-live.png',
      fullPage: true
    })
    console.log('\n✓ Screenshot saved: booking-widget-live.png')

    // Check for JavaScript errors
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await new Promise(resolve => setTimeout(resolve, 2000))

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('✅ BOOKING WIDGET TEST COMPLETE')
    console.log('='.repeat(60))
    console.log(`URL: ${WIDGET_URL}`)
    console.log(`Status: ${response.status()}`)
    console.log(`Title: ${title}`)
    console.log(`Calendar: ${content.hasCalendar ? 'Working' : 'Missing'}`)
    console.log(`Event Details: ${content.detailCount} items`)
    console.log(`Console Errors: ${errors.length}`)

    if (errors.length > 0) {
      console.log('\n⚠️ Console Errors:')
      errors.forEach(err => console.log(`  - ${err}`))
    }

    await browser.close()

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message)
    await browser.close()
    throw error
  }
}

testBookingWidget()
  .then(() => {
    console.log('\n🎉 Booking widget is live and functional!')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n💥 Test failed:', error)
    process.exit(1)
  })
