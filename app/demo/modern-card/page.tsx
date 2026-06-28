"use client"

import { ModernCardLayout } from "@/components/booking/modern-card-layout"

export default function ModernCardDemoPage() {
  const demoEventType = {
    id: "demo-modern-card",
    title: "30-Minuten Beratungsgespräch",
    description: "Buche ein kostenloses Beratungsgespräch mit unserem Team. Wir besprechen deine Anforderungen und zeigen dir, wie wir dir helfen können.",
    duration: 30,
    slug: "demo-modern-card",
  }

  return <ModernCardLayout eventType={demoEventType} />
}
