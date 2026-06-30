import puppeteer from 'puppeteer'
import * as fs from 'fs'

const FRONTEND_URL = 'https://www.dabrock.ai/booking-config.html'

async function extractConfigAndCreatePage() {
  console.log('🚀 Extracting Configuration and Creating Test Page')
  console.log('=' .repeat(60))

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1920, height: 1080 })

    console.log('\n📄 Step 1: Loading Configuration Page...')
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle0', timeout: 30000 })
    console.log('✓ Page loaded')

    // Extract current configuration from the form
    console.log('\n📊 Step 2: Extracting Configuration...')

    const config = await page.evaluate(() => {
      const getVal = (id) => {
        const el = document.getElementById(id)
        return el ? el.value : ''
      }

      return {
        eventTitle: getVal('eventTitle'),
        eventDescription: getVal('eventDescription'),
        price: parseInt(getVal('price')) || 0,
        currency: getVal('currency'),
        duration: parseInt(getVal('duration')) || 30,
        bufferTime: parseInt(getVal('bufferTime')) || 0,
        timeRange: getVal('timeRange'),
        videoProvider: getVal('videoProvider'),
        googleClientId: getVal('googleClientId'),
        googleCalendarId: getVal('googleCalendarId') || 'primary',
        primaryColor: getVal('primaryColor'),
        backgroundColor: getVal('backgroundColor'),
        textColor: getVal('textColor'),
        fontFamily: getVal('fontFamily')
      }
    })

    console.log('✓ Configuration extracted:')
    console.log(JSON.stringify(config, null, 2))

    // ==================== CREATE TEST PAGE ====================
    console.log('\n📝 Step 3: Creating Test Calendar Page...')

    const videoProviderName = config.videoProvider === 'google_meet' ? 'Google Meet' :
                              config.videoProvider === 'zoom' ? 'Zoom' :
                              config.videoProvider === 'teams' ? 'Microsoft Teams' :
                              config.videoProvider

    const [startTime, endTime] = config.timeRange.split('-')

    const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.eventTitle} - Booking Calendar</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: ${config.fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      max-width: 1200px;
      width: 100%;
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
    }
    .info-section {
      padding: 60px;
      background: ${config.backgroundColor};
      color: ${config.textColor};
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .calendar-section {
      padding: 60px;
      background: #f9fafb;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    h1 {
      color: ${config.primaryColor};
      font-size: 2.5rem;
      margin-bottom: 20px;
      font-weight: 700;
      line-height: 1.2;
    }
    .description {
      font-size: 1.1rem;
      line-height: 1.8;
      color: #4b5563;
      margin-bottom: 30px;
    }
    .details {
      display: grid;
      gap: 15px;
      margin-top: 30px;
    }
    .detail-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 18px 20px;
      background: #f3f4f6;
      border-radius: 12px;
      border-left: 4px solid ${config.primaryColor};
      transition: transform 0.2s;
    }
    .detail-item:hover {
      transform: translateX(5px);
    }
    .detail-icon {
      font-size: 1.5rem;
    }
    .detail-content {
      flex: 1;
    }
    .detail-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .detail-value {
      color: ${config.primaryColor};
      font-weight: 700;
      font-size: 1.1rem;
    }
    .calendar-widget {
      background: white;
      border-radius: 15px;
      padding: 40px;
      border: 2px solid ${config.primaryColor};
      min-height: 450px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .calendar-placeholder {
      font-size: 4rem;
      margin-bottom: 20px;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.05); }
    }
    .calendar-text {
      color: #6b7280;
      font-size: 1.1rem;
      margin-bottom: 10px;
    }
    .calendar-subtext {
      color: #9ca3af;
      font-size: 0.9rem;
    }
    .powered-by {
      text-align: center;
      padding: 25px;
      background: linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%);
      color: #6b7280;
      font-size: 0.9rem;
      grid-column: 1 / -1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .cta-button {
      background: ${config.primaryColor};
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 10px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 20px;
      transition: all 0.3s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
    }
    @media (max-width: 968px) {
      .container {
        grid-template-columns: 1fr;
      }
      .info-section, .calendar-section {
        padding: 40px;
      }
      h1 {
        font-size: 2rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="info-section">
      <h1>${config.eventTitle}</h1>
      <p class="description">${config.eventDescription}</p>

      <div class="details">
        <div class="detail-item">
          <span class="detail-icon">💰</span>
          <div class="detail-content">
            <div class="detail-label">Preis</div>
            <div class="detail-value">${config.price === 0 ? 'Kostenlos' : config.price + ' ' + config.currency}</div>
          </div>
        </div>

        <div class="detail-item">
          <span class="detail-icon">⏱️</span>
          <div class="detail-content">
            <div class="detail-label">Dauer</div>
            <div class="detail-value">${config.duration} Minuten</div>
          </div>
        </div>

        <div class="detail-item">
          <span class="detail-icon">📹</span>
          <div class="detail-content">
            <div class="detail-label">Video-Plattform</div>
            <div class="detail-value">${videoProviderName}</div>
          </div>
        </div>

        <div class="detail-item">
          <span class="detail-icon">🕐</span>
          <div class="detail-content">
            <div class="detail-label">Verfügbarkeit</div>
            <div class="detail-value">${startTime}:00 - ${endTime}:00 Uhr</div>
          </div>
        </div>

        ${config.bufferTime > 0 ? `
        <div class="detail-item">
          <span class="detail-icon">⏳</span>
          <div class="detail-content">
            <div class="detail-label">Pufferzeit</div>
            <div class="detail-value">${config.bufferTime} Minuten</div>
          </div>
        </div>
        ` : ''}
      </div>
    </div>

    <div class="calendar-section">
      <div class="calendar-widget">
        <div class="calendar-placeholder">📅</div>
        <p class="calendar-text"><strong>Interaktiver Kalender</strong></p>
        <p class="calendar-subtext">Hier würde das Live-Booking-Widget erscheinen</p>
        <p class="calendar-subtext">(Nach Google Calendar API Integration verfügbar)</p>
        <button class="cta-button" onclick="alert('Kalender-Integration in Kürze verfügbar!')">
          📧 Jetzt Termin anfragen
        </button>
      </div>
    </div>

    <div class="powered-by">
      <span>⚡</span>
      <span><strong>Powered by Dabrock Booking System</strong></span>
      <span>•</span>
      <span>Erstellt am ${new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
    </div>
  </div>
</body>
</html>`

    // Save to file
    const testPagePath = '/mnt/e/CodelocalLLM/dabrock-homepage/out/booking-test.html'
    fs.writeFileSync(testPagePath, html, 'utf-8')
    console.log(`✓ Test page created: ${testPagePath}`)

    // Take screenshot of original config page
    await page.screenshot({
      path: '/mnt/e/CodelocalLLM/booking-saas/tests/screenshots/config-source.png',
      fullPage: true
    })
    console.log('✓ Screenshot saved')

    // ==================== SUMMARY ====================
    console.log('\n' + '='.repeat(60))
    console.log('📊 CONFIGURATION SUMMARY')
    console.log('='.repeat(60))
    console.log('Event Title:', config.eventTitle)
    console.log('Duration:', config.duration, 'minutes')
    console.log('Buffer Time:', config.bufferTime, 'minutes')
    console.log('Price:', config.price === 0 ? 'Kostenlos' : `${config.price} ${config.currency}`)
    console.log('Time Range:', config.timeRange)
    console.log('Video Provider:', videoProviderName)
    console.log('Primary Color:', config.primaryColor)
    console.log('Font Family:', config.fontFamily)
    console.log('='.repeat(60))

    await browser.close()
    console.log('✓ Browser closed')

    return { config, testPagePath }

  } catch (error: any) {
    console.error('\n❌ Failed:', error.message)
    await browser.close()
    throw error
  }
}

// Run
extractConfigAndCreatePage()
  .then(({ config, testPagePath }) => {
    console.log('\n🎉 Test page created successfully!')
    console.log(`\n📄 File: ${testPagePath}`)
    console.log('\n📤 Next steps:')
    console.log('1. cd /mnt/e/CodelocalLLM/dabrock-homepage')
    console.log('2. ./deploy.sh')
    console.log('3. View at: https://www.dabrock.ai/booking-test.html')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n💥 Failed:', error)
    process.exit(1)
  })
