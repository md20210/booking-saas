"use client"

import { SplitScreenLayout } from "@/components/booking/split-screen-layout"

export default function SplitScreenDemoPage() {
  const demoEventType = {
    id: "demo-split-screen",
    title: "Kostenfreies Erstgespräch",
    description: "Lerne uns kennen und erzähle uns von deinem Projekt. In 30 Minuten finden wir heraus, wie wir dir am besten helfen können.",
    duration: 30,
    slug: "demo-split-screen",
  }

  return <SplitScreenLayout eventType={demoEventType} />
}
