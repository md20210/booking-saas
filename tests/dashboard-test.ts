import puppeteer from 'puppeteer'

const BASE_URL = 'https://booking-saas-production-c352.up.railway.app'

async function testDashboard() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 720 })

  try {
    console.log('🧪 Testing complete user flow...\n')

    const timestamp = Date.now()
    const email = `test${timestamp}@example.com`
    const password = 'TestPassword123!'

    // 1. Register
    console.log('1️⃣  Registering...')
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle2' })
    await page.type('input[name="name"]', 'Test User')
    await page.type('input[name="email"]', email)
    await page.type('input[name="password"]', password)
    await page.click('button[type="submit"]')
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {})

    // 2. Login
    console.log('2️⃣  Logging in...')
    await page.goto(`${BASE_URL}/api/auth/signin`, { waitUntil: 'networkidle2' })
    await page.waitForSelector('input[name="email"], input[type="email"]', { timeout: 5000 })
    await page.type('input[name="email"], input[type="email"]', email)
    await page.type('input[name="password"], input[type="password"]', password)
    await page.click('button[type="submit"]')
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {})

    const url = page.url()
    console.log(`   URL after login: ${url}`)

    // 3. Check if we're actually on dashboard
    if (!url.includes('/dashboard')) {
      throw new Error(`Not on dashboard! Current URL: ${url}`)
    }

    // 4. Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 5. Check for errors on page
    const pageText = await page.evaluate(() => document.body.textContent || '')

    console.log('3️⃣  Checking dashboard content...')

    if (pageText.includes('Error') || pageText.includes('error') ||
        pageText.includes('Failed') || pageText.includes('failed')) {
      console.log('   ⚠️  Found error text on dashboard')
      console.log('   First 500 chars:', pageText.substring(0, 500))
    }

    // 6. Check if dashboard has navigation or content
    const hasContent = await page.evaluate(() => {
      const nav = document.querySelector('nav')
      const main = document.querySelector('main')
      const header = document.querySelector('header')
      return {
        hasNav: !!nav,
        hasMain: !!main,
        hasHeader: !!header,
        bodyLength: document.body.textContent?.length || 0
      }
    })

    console.log('   Dashboard structure:', hasContent)

    if (hasContent.bodyLength < 100) {
      throw new Error('Dashboard appears empty (less than 100 chars)')
    }

    // 7. Take screenshot
    await page.screenshot({ path: '/tmp/dashboard-screenshot.png' })
    console.log('   📸 Screenshot saved to /tmp/dashboard-screenshot.png')

    // 8. Check console errors
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await new Promise(resolve => setTimeout(resolve, 1000))

    if (consoleErrors.length > 0) {
      console.log('   ⚠️  Console errors found:')
      consoleErrors.forEach(err => console.log('      -', err))
    }

    console.log('\n✅ Dashboard loads and contains content')

  } catch (error) {
    console.error('\n❌ TEST FAILED:')
    console.error(error)

    await page.screenshot({ path: '/tmp/dashboard-error.png' })
    console.log('Screenshot saved to /tmp/dashboard-error.png')

    process.exit(1)
  } finally {
    await browser.close()
  }
}

testDashboard()
