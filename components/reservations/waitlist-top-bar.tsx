"use client"

import { Clock, Plus, TrendingUp, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CURRENT_DATE,
  SERVICE_PERIOD,
  getActiveStats,
} from "@/lib/waitlist-data"

interface WaitlistTopBarProps {
  onAddParty: () => void
}

export function WaitlistTopBar({ onAddParty }: WaitlistTopBarProps) {
  const stats = getActiveStats()

  const accuracyColor =
    stats.accuracyPct > 85
      ? "text-emerald-400"
      : stats.accuracyPct >= 70
        ? "text-amber-400"
        : "text-rose-400"

  return (
    <div className="sticky top-0 z-30 border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-xl">
      <div className="flex flex-col gap-3 px-4 py-3 lg:px-6">
        {/* Row 1: Title + date + service */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-zinc-100 lg:text-xl">Waitlist</h1>
            <span className="text-sm text-zinc-500">{CURRENT_DATE}</span>
            <Badge variant="outline" className="border-zinc-700 bg-zinc-800/60 text-xs text-zinc-300">
              {SERVICE_PERIOD}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Users className="h-3.5 w-3.5" />
            <span>
              Active: <span className="font-semibold text-zinc-200">{stats.parties} parties</span>{" "}
              &middot; <span className="font-semibold text-zinc-200">{stats.guests} guests</span>
            </span>
          </div>
        </div>

        {/* Row 2: Metrics + CTA */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-zinc-500" />
              <span className="text-zinc-500">Avg Wait:</span>
              <span className="font-semibold text-zinc-200">{stats.avgWait} min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className={`h-3.5 w-3.5 ${accuracyColor}`} />
              <span className="text-zinc-500">Quote Accuracy:</span>
              <span className={`font-semibold ${accuracyColor}`}>{stats.accuracyPct}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-zinc-500">Longest Wait:</span>
              <span className="font-semibold text-amber-400">{stats.longestWait} min</span>
            </div>
          </div>
          <Button
            size="sm"
            onClick={onAddParty}
            className="bg-emerald-600 text-white hover:bg-emerald-500"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add to Waitlist
          </Button>
        </div>
      </div>
    </div>
  )
}
