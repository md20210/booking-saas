"use client"

import { CalendlyLayout } from "@/components/booking/calendly-layout"

export default function CalendlyDemoPage() {
  // Mock event data
  const mockEvent = {
    id: "demo-event-1",
    title: "30 Minute Meeting",
    description: "A brief 30-minute meeting to discuss your project needs and how we can help you achieve your goals.",
    duration: 30,
    user: {
      name: "John Doe",
      image: undefined
    }
  }

  const mockDesign = {
    primaryColor: "#006BFF",
    logo: undefined,
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  }

  const handleBooking = (data: any) => {
    console.log("Booking data:", data)
    alert("Booking successful! (Demo mode - no actual booking created)")
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto 40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', textAlign: 'center', marginBottom: '12px' }}>
          Calendly-Style Layout Demo
        </h1>
        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '16px' }}>
          Interactive preview of the Calendly-inspired booking widget
        </p>
      </div>

      <CalendlyLayout
        eventType={mockEvent}
        design={mockDesign}
        onBooking={handleBooking}
      />

      <div style={{ maxWidth: '800px', margin: '60px auto 0', background: 'white', padding: '32px', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>How to Use</h2>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>In Your WordPress Site:</h3>
          <pre style={{
            background: '#1a202c',
            color: '#e2e8f0',
            padding: '16px',
            borderRadius: '6px',
            overflow: 'auto',
            fontSize: '14px'
          }}>
{`[mybooking event="your-event-slug" template="calendly" primary_color="#006BFF"]`}
          </pre>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>As Embed Code:</h3>
          <pre style={{
            background: '#1a202c',
            color: '#e2e8f0',
            padding: '16px',
            borderRadius: '6px',
            overflow: 'auto',
            fontSize: '14px'
          }}>
{`<iframe
  src="https://booking-saas-production-c352.up.railway.app/book/your-event-slug?template=calendly"
  width="100%"
  height="700"
  frameborder="0"
></iframe>`}
          </pre>
        </div>

        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Features:</h3>
          <ul style={{ listStyle: 'disc', paddingLeft: '24px', color: '#4b5563', lineHeight: '1.8' }}>
            <li>Clean sidebar with event information</li>
            <li>Step-by-step booking flow (Date → Time → Details → Confirmation)</li>
            <li>Responsive calendar grid</li>
            <li>Time slot selection</li>
            <li>Contact form with validation</li>
            <li>Success confirmation screen</li>
            <li>Fully customizable colors and fonts</li>
            <li>Mobile responsive</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
