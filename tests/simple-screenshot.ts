import puppeteer from 'puppeteer'

async function takeScreenshot() {
  const BASE_URL = 'http://localhost:3000'

  console.log('🚀 Opening browser...')
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 720 })

    // Try homepage first
    console.log('📄 Loading homepage:', BASE_URL)
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 10000 })
    await page.screenshot({ path: 'tests/screenshots/homepage.png', fullPage: true })
    console.log('✅ Homepage screenshot saved')

    const homeUrl = page.url()
    console.log('Current URL:', homeUrl)

    // Try register page
    console.log('\n📄 Loading /register...')
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'domcontentloaded', timeout: 10000 })
    await new Promise(resolve => setTimeout(resolve, 2000))
    await page.screenshot({ path: 'tests/screenshots/register-page.png', fullPage: true })
    console.log('✅ Register page screenshot saved')

    const registerUrl = page.url()
    console.log('Current URL:', registerUrl)

    // Check for form fields
    const nameInput = await page.$('input[name="name"]')
    const emailInput = await page.$('input[type="email"]')
    const passwordInput = await page.$('input[type="password"]')
    const submitButton = await page.$('button[type="submit"]')

    console.log('\n🔍 Form elements found:')
    console.log('- Name input:', nameInput ? '✅' : '❌')
    console.log('- Email input:', emailInput ? '✅' : '❌')
    console.log('- Password input:', passwordInput ? '✅' : '❌')
    console.log('- Submit button:', submitButton ? '✅' : '❌')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await browser.close()
  }
}

takeScreenshot()
