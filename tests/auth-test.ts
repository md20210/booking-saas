import puppeteer from 'puppeteer'

const BASE_URL = process.env.TEST_URL || 'https://booking-saas-production-c352.up.railway.app'

async function testAuth() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 720 })

  try {
    console.log('🧪 Testing actual registration and login...\n')

    // Generate unique email
    const timestamp = Date.now()
    const email = `test${timestamp}@example.com`
    const password = 'TestPassword123!'
    const name = 'Test User'

    // Step 1: Register
    console.log('1️⃣  Navigating to register page...')
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle2' })

    console.log('2️⃣  Filling registration form...')
    await page.type('input[name="name"]', name)
    await page.type('input[name="email"]', email)
    await page.type('input[name="password"]', password)

    console.log('3️⃣  Submitting registration...')
    await page.click('button[type="submit"]')

    // Wait for redirect or response
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {})

    // Check URL
    const currentUrl = page.url()
    console.log(`   Current URL: ${currentUrl}`)

    // Registration redirects to signin - that's success!
    if (currentUrl.includes('/api/auth/signin')) {
      console.log('   ✅ Registration successful (redirected to signin)\n')
    } else {
      // Check for error messages
      const errorEl = await page.$('.bg-red-50, [class*="error"]')
      if (errorEl) {
        const errorText = await page.evaluate((el) => el?.textContent || '', errorEl)
        throw new Error(`Registration failed: ${errorText}`)
      }
      console.log('   ✅ Registration successful\n')
    }

    // Step 2: Login
    console.log('4️⃣  Navigating to login page...')
    await page.goto(`${BASE_URL}/api/auth/signin`, { waitUntil: 'networkidle2' })

    console.log('5️⃣  Filling login form...')

    // Wait for form to appear
    await page.waitForSelector('input[name="email"], input[type="email"]', { timeout: 5000 })

    await page.type('input[name="email"], input[type="email"]', email)
    await page.type('input[name="password"], input[type="password"]', password)

    console.log('6️⃣  Submitting login...')
    await page.click('button[type="submit"]')

    // Wait for redirect
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {})

    const finalUrl = page.url()
    const finalContent = await page.content()

    console.log(`   Final URL: ${finalUrl}`)

    // Check if logged in
    if (finalUrl.includes('/signin') || finalUrl.includes('/error')) {
      const errorText = await page.evaluate(() => {
        return document.body.textContent || ''
      })
      throw new Error(`Login failed. Still on signin/error page. Content: ${errorText.substring(0, 200)}`)
    }

    console.log('   ✅ Login successful!\n')

    console.log('✅ ALL AUTH TESTS PASSED')

  } catch (error) {
    console.error('\n❌ AUTH TEST FAILED:')
    console.error(error)

    // Screenshot for debugging
    await page.screenshot({ path: '/tmp/auth-test-failure.png' })
    console.log('   Screenshot saved to /tmp/auth-test-failure.png')

    process.exit(1)
  } finally {
    await browser.close()
  }
}

testAuth()
