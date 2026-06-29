import puppeteer from 'puppeteer'

const BASE_URL = 'https://booking-saas-production-c352.up.railway.app'

async function auditUI() {
  console.log('🔍 Auditing current UI state...')

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  try {
    const page = await browser.newPage()

    // Desktop
    await page.setViewport({ width: 1920, height: 1080 })

    console.log('\n📱 Testing pages...')

    // 1. Homepage
    console.log('1. Homepage (Desktop)')
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 10000 })
    await page.screenshot({ path: 'tests/screenshots/audit-01-home-desktop.png', fullPage: true })

    // 2. Register
    console.log('2. Register (Desktop)')
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'domcontentloaded', timeout: 10000 })
    await new Promise(resolve => setTimeout(resolve, 1000))
    await page.screenshot({ path: 'tests/screenshots/audit-02-register-desktop.png', fullPage: true })

    // Mobile
    await page.setViewport({ width: 375, height: 812 })

    console.log('3. Homepage (Mobile)')
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 10000 })
    await page.screenshot({ path: 'tests/screenshots/audit-03-home-mobile.png', fullPage: true })

    console.log('4. Register (Mobile)')
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'domcontentloaded', timeout: 10000 })
    await new Promise(resolve => setTimeout(resolve, 1000))
    await page.screenshot({ path: 'tests/screenshots/audit-04-register-mobile.png', fullPage: true })

    console.log('\n✅ UI Audit complete!')
    console.log('Screenshots saved to tests/screenshots/')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await browser.close()
  }
}

auditUI()
