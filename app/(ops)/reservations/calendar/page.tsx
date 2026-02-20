"use client"

import { CalendarView } from "@/components/reservations/calendar-view"

export default function CalendarPage() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <CalendarView />
    </div>
  )
}
