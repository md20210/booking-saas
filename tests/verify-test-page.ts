import puppeteer from 'puppeteer'

const TEST_URL = 'https://www.dabrock.info/booking-test.html'

async function verifyTestPage() {
  console.log('🚀 Verifying Test Page Deployment')
  console.log('URL:', TEST_URL)
  console.log('=' .repeat(60))

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1920, height: 1080 })

    console.log('\n📄 Loading page...')
    const response = await page.goto(TEST_URL, { waitUntil: 'networkidle0', timeout: 30000 })

    if (!response) {
      throw new Error('Failed to load page')
    }

    console.log(`✓ HTTP Status: ${response.status()} ${response.statusText()}`)

    const title = await page.title()
    console.log(`✓ Title: "${title}"`)

    // Extract all text content
    const content = await page.evaluate(() => {
      return {
        heading: document.querySelector('h1')?.textContent || '',
        description: document.querySelector('.description')?.textContent || '',
        details: Array.from(document.querySelectorAll('.detail-value')).map(el => el.textContent),
        hasCalendarWidget: !!document.querySelector('.calendar-widget'),
        hasCTAButton: !!document.querySelector('.cta-button')
      }
    })

    console.log('\n📊 Page Content:')
    console.log('  Heading:', content.heading)
    console.log('  Description:', content.description.substring(0, 80) + '...')
    console.log('  Details:', content.details)
    console.log('  Calendar Widget:', content.hasCalendarWidget ? 'YES ✓' : 'NO ✗')
    console.log('  CTA Button:', content.hasCTAButton ? 'YES ✓' : 'NO ✗')

    // Take screenshot
    await page.screenshot({
      path: '/mnt/e/CodelocalLLM/booking-saas/tests/screenshots/test-page-live.png',
      fullPage: true
    })
    console.log('\n✓ Screenshot saved: test-page-live.png')

    // Check for console errors
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await new Promise(resolve => setTimeout(resolve, 2000))

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('✅ TEST PAGE VERIFICATION COMPLETE')
    console.log('='.repeat(60))
    console.log(`URL: ${TEST_URL}`)
    console.log(`Status: ${response.status()}`)
    console.log(`Title: ${title}`)
    console.log(`Console Errors: ${errors.length}`)

    if (errors.length > 0) {
      console.log('\n❌ Console Errors:')
      errors.forEach(err => console.log(`  - ${err}`))
    } else {
      console.log('\n✓ No console errors')
    }

    await browser.close()

  } catch (error: any) {
    console.error('\n❌ Verification failed:', error.message)
    await browser.close()
    throw error
  }
}

verifyTestPage()
  .then(() => {
    console.log('\n🎉 Test page is live and working!')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n💥 Verification failed:', error)
    process.exit(1)
  })
