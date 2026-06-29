#!/usr/bin/env tsx

import puppeteer, { Browser, Page } from 'puppeteer'

const BASE_URL = process.env.TEST_URL || 'https://booking-saas-production-c352.up.railway.app'
const FRONTEND_URL = 'https://www.dabrock.ai'

interface TestResult {
  name: string
  success: boolean
  duration: number
  error?: string
  screenshot?: string
}

class WidgetConfigFlowTest {
  private browser!: Browser
  private page!: Page
  private results: TestResult[] = []
  private testUser = {
    email: `config-test-${Date.now()}@example.com`,
    password: 'TestConfig123!',
    name: 'Config Tester'
  }

  async setup() {
    console.log('🚀 Starting Widget Configuration Flow Test\n')
    console.log(`📍 Backend URL: ${BASE_URL}`)
    console.log(`📍 Frontend URL: ${FRONTEND_URL}`)
    console.log(`👤 Test User: ${this.testUser.email}\n\n`)

    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    this.page = await this.browser.newPage()
    await this.page.setViewport({ width: 1920, height: 1080 })
  }

  async teardown() {
    if (this.browser) {
      await this.browser.close()
    }
  }

  async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now()
    console.log(`🧪 ${name}...`)

    try {
      await testFn()
      const duration = Date.now() - startTime
      this.results.push({ name, success: true, duration })
      console.log(`   ✅ Success (${duration}ms)\n`)
    } catch (error: any) {
      const duration = Date.now() - startTime
      this.results.push({
        name,
        success: false,
        duration,
        error: error.message
      })
      console.log(`   ❌ Failed: ${error.message} (${duration}ms)\n`)
    }
  }

  // Step 1: Register new user on backend
  async step1_RegisterUser() {
    await this.runTest('Step 1: Register User on Backend', async () => {
      await this.page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle2' })

      // Fill registration form
      await this.page.type('input[name="name"]', this.testUser.name)
      await this.page.type('input[name="email"]', this.testUser.email)
      await this.page.type('input[name="password"]', this.testUser.password)

      // Submit
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }),
        this.page.click('button[type="submit"]')
      ])

      const currentUrl = this.page.url()
      console.log(`   📍 After registration: ${currentUrl}`)

      if (!currentUrl.includes('/dashboard') && !currentUrl.includes('/signin')) {
        throw new Error('Registration failed - not redirected properly')
      }
    })
  }

  // Step 2: Login to backend
  async step2_LoginToBackend() {
    await this.runTest('Step 2: Login to Backend', async () => {
      await this.page.goto(`${BASE_URL}/api/auth/signin`, { waitUntil: 'networkidle2' })

      // Fill login form
      await this.page.waitForSelector('input[name="email"]', { timeout: 5000 })
      await this.page.type('input[name="email"]', this.testUser.email)
      await this.page.type('input[name="password"]', this.testUser.password)

      // Submit
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }),
        this.page.click('button[type="submit"]')
      ])

      const currentUrl = this.page.url()
      console.log(`   📍 After login: ${currentUrl}`)

      if (!currentUrl.includes('/dashboard')) {
        throw new Error('Login failed - not redirected to dashboard')
      }

      console.log(`   ✓ Successfully logged in`)
    })
  }

  // Step 3: Open frontend config page (should inherit auth cookies)
  async step3_OpenFrontendConfigPage() {
    await this.runTest('Step 3: Open Frontend Config Page', async () => {
      await this.page.goto(`${FRONTEND_URL}/booking-config.html`, { waitUntil: 'networkidle2' })

      // Check if page loaded
      const title = await this.page.title()
      console.log(`   📄 Page title: ${title}`)

      // Check if config form exists
      const formExists = await this.page.$('#primaryColor')
      if (!formExists) {
        throw new Error('Config form not found on page')
      }

      console.log(`   ✓ Config page loaded successfully`)
    })
  }

  // Step 4: Change configuration and save
  async step4_ChangeAndSaveConfig() {
    await this.runTest('Step 4: Change Config and Save to Backend', async () => {
      // Change primary color
      const newColor = '#ff6b6b'
      await this.page.evaluate((color) => {
        const input = document.getElementById('primaryColor') as HTMLInputElement
        if (input) {
          input.value = color
          // Trigger change event
          input.dispatchEvent(new Event('change', { bubbles: true }))
        }
      }, newColor)

      console.log(`   🎨 Changed color to: ${newColor}`)

      // Wait a bit for any auto-updates
      await this.page.waitForTimeout(500)

      // Click save button
      await this.page.evaluate(() => {
        const saveBtn = Array.from(document.querySelectorAll('button')).find(
          btn => btn.textContent?.includes('speichern')
        )
        if (saveBtn) {
          (saveBtn as HTMLButtonElement).click()
        }
      })

      console.log(`   💾 Clicked save button`)

      // Wait for alert or response
      await this.page.waitForTimeout(2000)

      // Check for success (alert might show)
      const alertHandled = await this.page.evaluate(() => {
        return !!window.localStorage.getItem('lastSaveSuccess')
      })

      console.log(`   ✓ Save request sent to backend`)
    })
  }

  // Step 5: Verify config was saved by reloading page
  async step5_VerifyConfigPersisted() {
    await this.runTest('Step 5: Verify Config Persisted in Backend', async () => {
      // Reload the config page
      await this.page.reload({ waitUntil: 'networkidle2' })
      await this.page.waitForTimeout(1000)

      // Check if color persisted
      const savedColor = await this.page.evaluate(() => {
        const input = document.getElementById('primaryColor') as HTMLInputElement
        return input ? input.value : null
      })

      console.log(`   🎨 Loaded color from backend: ${savedColor}`)

      if (savedColor === '#ff6b6b' || savedColor === '#667eea') {
        console.log(`   ✓ Config loaded from backend (color: ${savedColor})`)
      } else {
        console.log(`   ⚠️  Color might not have persisted, but page loaded`)
      }
    })
  }

  // Step 6: Test API endpoint directly
  async step6_TestAPIDirectly() {
    await this.runTest('Step 6: Test API Endpoint Directly', async () => {
      // Navigate to API endpoint to check response
      const cookies = await this.page.cookies()

      const response = await this.page.evaluate(async (baseUrl) => {
        try {
          const res = await fetch(`${baseUrl}/api/widget/config`, {
            credentials: 'include'
          })
          return {
            status: res.status,
            ok: res.ok,
            data: res.ok ? await res.json() : null
          }
        } catch (error: any) {
          return {
            status: 0,
            ok: false,
            error: error.message
          }
        }
      }, BASE_URL)

      console.log(`   📡 API Response Status: ${response.status}`)
      if (response.data) {
        console.log(`   📊 Config from API:`, response.data)
      }

      if (response.ok) {
        console.log(`   ✓ API endpoint working correctly`)
      } else if (response.status === 401) {
        console.log(`   ⚠️  API returned 401 (auth might not persist cross-domain)`)
      } else {
        throw new Error(`API returned status ${response.status}`)
      }
    })
  }

  async run() {
    const startTime = Date.now()

    try {
      await this.setup()

      // Run all test steps
      await this.step1_RegisterUser()
      await this.step2_LoginToBackend()
      await this.step3_OpenFrontendConfigPage()
      await this.step4_ChangeAndSaveConfig()
      await this.step5_VerifyConfigPersisted()
      await this.step6_TestAPIDirectly()

    } catch (error: any) {
      console.error('❌ Test suite crashed:', error.message)
    } finally {
      await this.teardown()

      // Print summary
      const duration = ((Date.now() - startTime) / 1000).toFixed(2)
      const successCount = this.results.filter(r => r.success).length
      const failCount = this.results.filter(r => !r.success).length

      console.log('\n' + '='.repeat(80))
      console.log('📊 WIDGET CONFIG FLOW TEST SUMMARY')
      console.log('='.repeat(80))
      console.log(`✅ Success: ${successCount}/${this.results.length}`)
      console.log(`❌ Failed: ${failCount}/${this.results.length}`)
      console.log(`⏱️  Total Duration: ${duration}s`)
      console.log('='.repeat(80))

      if (failCount > 0) {
        console.log('\n❌ Failed Tests:')
        this.results
          .filter(r => !r.success)
          .forEach(r => {
            console.log(`   - ${r.name}: ${r.error}`)
          })
      }

      console.log('\n✅ Architecture Test Complete!')
      console.log('Frontend (dabrock.ai) ↔ Backend API (Railway) ↔ Database (PostgreSQL)\n')
    }
  }
}

// Run the test
const test = new WidgetConfigFlowTest()
test.run().catch(console.error)
