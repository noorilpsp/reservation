"use client"

import { Suspense, useState } from "react"
import { TopBar } from "@/components/reservations/top-bar"
import { HeroStats } from "@/components/reservations/hero-stats"
import { TimelineCapacityStrip } from "@/components/reservations/timeline-capacity-strip"
import { UpcomingReservations } from "@/components/reservations/upcoming-reservations"
import { WaitlistPanel } from "@/components/reservations/waitlist-panel"
import { TurnTracker } from "@/components/reservations/turn-tracker"
import { PaceStrip } from "@/components/reservations/pace-strip"
import {
  type ServicePeriod,
  reservations,
  getHeroStats,
} from "@/lib/reservations-data"
import { Toaster } from "sonner"

function ReservationsDashboardPageContent() {
  const [servicePeriod, setServicePeriod] = useState<ServicePeriod>("dinner")
  const stats = getHeroStats(reservations)

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <Toaster
        theme="dark"
        toastOptions={{
          className: "border-zinc-700 bg-zinc-900 text-foreground",
        }}
      />

      <TopBar
        servicePeriod={servicePeriod}
        onServicePeriodChange={setServicePeriod}
      />

      <main className="flex flex-1 flex-col gap-5 py-5">
        {/* Section 1: Hero Stats */}
        <HeroStats stats={stats} />

        {/* Section 2: Capacity Forecast (Timeline strip style) */}
        <section aria-label="Capacity forecast" className="px-4 lg:px-6">
          <TimelineCapacityStrip
            zoom="30min"
            sticky={false}
            synced={false}
          />
        </section>

        {/* Section 3: Two-Column Layout */}
        <section
          aria-label="Reservations and floor status"
          className="grid gap-5 px-4 lg:grid-cols-[1fr_400px] lg:px-6"
        >
          {/* Left: Upcoming Reservations */}
          <div className="min-h-[400px]">
            <UpcomingReservations />
          </div>

          {/* Right: Waitlist + Turn Tracker stacked */}
          <div className="flex flex-col gap-5">
            <WaitlistPanel />
            <TurnTracker />
          </div>
        </section>

        {/* Section 4: Pace Strip */}
        <PaceStrip />
      </main>
    </div>
  )
}

export default function ReservationsDashboardPage() {
  return (
    <Suspense fallback={<div className="h-full bg-zinc-950" />}>
      <ReservationsDashboardPageContent />
    </Suspense>
  )
}
