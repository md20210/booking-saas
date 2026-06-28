"use client"

import { DarkModeLayout } from "@/components/booking/dark-mode-layout"

export default function DarkModeDemoPage() {
  return <DarkModeLayout eventType={{
    id: "demo-dark", title: "Strategiegespräch", description: "Professionelles Beratungsgespräch für dein Business", duration: 45, slug: "demo-dark"
  }} />
}
