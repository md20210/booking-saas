"use client"
import { CorporateLayout } from "@/components/booking/corporate-layout"
export default function() {
  return <CorporateLayout eventType={{ id: "demo-corp", title: "Geschäftstermin", description: "Professioneller Business-Termin", duration: 60, slug: "demo-corp" }} />
}
