"use client"
import { TechLayout } from "@/components/booking/tech-layout"
export default function() {
  return <TechLayout eventType={{ id: "demo-tech", title: "Tech Consultation", description: "Technical deep dive session", duration: 60, slug: "demo-tech" }} />
}
