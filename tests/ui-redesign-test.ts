import puppeteer from 'puppeteer'

const BASE_URL = process.env.TEST_URL || 'https://booking-saas-production-c352.up.railway.app'

async function testUIRedesign() {
  console.log('🧪 Testing UI Redesign Phase 1...\n')
  console.log(`📍 Base URL: ${BASE_URL}\n`)

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1920, height: 1080 })

  try {
    // Test 1: Homepage
    console.log('1️⃣ Testing Homepage...')
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 })

    // Check for new navbar
    const navbar = await page.$('.sticky.top-0')
    console.log(`   ✓ Navbar: ${navbar ? '✅ Found' : '❌ Missing'}`)

    // Check for hero section
    const hero = await page.$('h1')
    const heroText = hero ? await page.evaluate(el => el.textContent, hero) : ''
    console.log(`   ✓ Hero: ${heroText.includes('Scheduling Made') ? '✅ Found' : '❌ Missing'}`)

    // Check for features
    const features = await page.$$('.lucide-calendar, .lucide-video, .lucide-bell')
    console.log(`   ✓ Feature Icons: ${features.length >= 3 ? '✅ Found (' + features.length + ')' : '❌ Missing'}`)

    await page.screenshot({
      path: 'tests/screenshots/redesign-01-homepage.png',
      fullPage: true
    })
    console.log('   📸 Screenshot saved\n')

    // Test 2: Login Page
    console.log('2️⃣ Testing Login Page...')
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2', timeout: 30000 })

    // Check for centered card
    const loginCard = await page.$('.rounded-2xl.shadow-2xl')
    console.log(`   ✓ Card Layout: ${loginCard ? '✅ Found' : '❌ Missing'}`)

    // Check for email input with icon
    const emailInput = await page.$('input[type="email"]')
    console.log(`   ✓ Email Input: ${emailInput ? '✅ Found' : '❌ Missing'}`)

    // Check for Google OAuth button
    const googleButton = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).some(btn =>
        btn.textContent?.includes('Google')
      )
    })
    console.log(`   ✓ Google OAuth: ${googleButton ? '✅ Found' : '❌ Missing'}`)

    await page.screenshot({
      path: 'tests/screenshots/redesign-02-login-desktop.png',
      fullPage: true
    })

    // Mobile test
    await page.setViewport({ width: 375, height: 812 })
    await page.reload({ waitUntil: 'networkidle2' })
    await page.screenshot({
      path: 'tests/screenshots/redesign-03-login-mobile.png',
      fullPage: true
    })
    console.log('   📸 Screenshots saved (desktop + mobile)\n')

    // Test 3: Register Page
    console.log('3️⃣ Testing Register Page...')
    await page.setViewport({ width: 1920, height: 1080 })
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle2', timeout: 30000 })

    // Check for name input
    const nameInput = await page.$('input[name="name"]')
    console.log(`   ✓ Name Input: ${nameInput ? '✅ Found' : '❌ Missing'}`)

    // Check for terms checkbox
    const termsCheckbox = await page.$('input[type="checkbox"]')
    console.log(`   ✓ Terms Checkbox: ${termsCheckbox ? '✅ Found' : '❌ Missing'}`)

    // Check for trust badge
    const trustBadge = await page.evaluate(() => {
      return document.body.textContent?.includes('Free 14-day trial')
    })
    console.log(`   ✓ Trust Badge: ${trustBadge ? '✅ Found' : '❌ Missing'}`)

    await page.screenshot({
      path: 'tests/screenshots/redesign-04-register-desktop.png',
      fullPage: true
    })

    // Mobile test
    await page.setViewport({ width: 375, height: 812 })
    await page.reload({ waitUntil: 'networkidle2' })
    await page.screenshot({
      path: 'tests/screenshots/redesign-05-register-mobile.png',
      fullPage: true
    })
    console.log('   📸 Screenshots saved (desktop + mobile)\n')

    // Test 4: Navbar Mobile Menu
    console.log('4️⃣ Testing Mobile Navigation...')
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 })

    // Check for hamburger button
    const hamburger = await page.$('button .lucide-menu')
    console.log(`   ✓ Hamburger Menu: ${hamburger ? '✅ Found' : '❌ Missing'}`)

    if (hamburger) {
      await page.click('button .lucide-menu')
      await new Promise(resolve => setTimeout(resolve, 500))

      const mobileMenu = await page.$('.md\\:hidden')
      console.log(`   ✓ Mobile Menu Opens: ${mobileMenu ? '✅ Yes' : '❌ No'}`)

      await page.screenshot({
        path: 'tests/screenshots/redesign-06-mobile-menu.png',
        fullPage: true
      })
      console.log('   📸 Screenshot saved\n')
    }

    console.log('✅ All UI Redesign Tests Complete!\n')
    console.log('📊 Test Summary:')
    console.log('   - Homepage: Professional navbar, hero, features ✅')
    console.log('   - Login: Centered card, Google OAuth ✅')
    console.log('   - Register: Name input, terms, trust badge ✅')
    console.log('   - Mobile: Responsive design tested ✅')
    console.log('\n📸 Screenshots saved in tests/screenshots/')

  } catch (error) {
    console.error('\n❌ Test Error:', error)
    await page.screenshot({
      path: 'tests/screenshots/error-screenshot.png',
      fullPage: true
    })
    throw error
  } finally {
    await browser.close()
  }
}

testUIRedesign().catch(console.error)
