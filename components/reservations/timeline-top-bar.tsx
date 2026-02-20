"use client"

import { useState, useEffect } from "react"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Filter,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  restaurantConfig,
  NOW_TIME,
  type ZoomLevel,
} from "@/lib/timeline-data"

interface TimelineTopBarProps {
  zoom: ZoomLevel
  onZoomChange: (z: ZoomLevel) => void
  zoneFilter: string
  onZoneFilterChange: (zone: string) => void
  showGhosts: boolean
  onShowGhostsChange: (v: boolean) => void
}

export function TimelineTopBar({
  zoom,
  onZoomChange,
  zoneFilter,
  onZoneFilterChange,
  showGhosts,
  onShowGhostsChange,
}: TimelineTopBarProps) {
  const [currentTime, setCurrentTime] = useState(NOW_TIME)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const [h, m] = prev.split(":").map(Number)
        const newM = m + 1
        if (newM >= 60) return `${(h + 1).toString().padStart(2, "0")}:00`
        return `${h.toString().padStart(2, "0")}:${newM.toString().padStart(2, "0")}`
      })
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (t: string) => {
    const [h, m] = t.split(":").map(Number)
    const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
    const ampm = h >= 12 ? "PM" : "AM"
    return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`
  }

  const zoneLabels: Record<string, string> = {
    all: "All Zones",
    main: "Main Dining",
    patio: "Patio",
    private: "Private Room",
  }

  return (
    <header className="sticky top-0 z-50 glass-surface-strong">
      {/* Row 1: Title, date, service period, CTA */}
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-foreground lg:text-base">Timeline View</h1>
          <div className="hidden items-center gap-1.5 sm:flex">
            <CalendarDays className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-muted-foreground">
              {restaurantConfig.currentDate}
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" aria-label="Previous day">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" aria-label="Next day">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-zinc-700 bg-zinc-800/60 text-foreground hover:bg-zinc-700/60">
                Dinner 5-11pm
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="border-zinc-700 bg-zinc-900">
              {restaurantConfig.servicePeriods.map((p) => (
                <DropdownMenuItem key={p.id} className="text-foreground focus:bg-zinc-800 focus:text-foreground">
                  {p.label} ({formatTime(p.start)} - {formatTime(p.end)})
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span className="tabular-nums font-mono text-foreground">{formatTime(currentTime)}</span>
          </div>
        </div>

        <Button size="sm" className="hidden bg-emerald-600 text-emerald-50 hover:bg-emerald-500 md:flex">
          <Plus className="mr-1.5 h-4 w-4" />
          New Reservation
        </Button>
      </div>

      {/* Row 2: Zoom, zone filter, ghost toggle */}
      <div className="flex items-center justify-between border-t border-zinc-800/50 px-4 py-2 lg:px-6">
        <div className="flex items-center gap-3">
          {/* Zoom levels */}
          <div className="flex items-center gap-1">
            <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Zoom</span>
            {(["1hr", "30min", "15min"] as ZoomLevel[]).map((z) => (
              <Button
                key={z}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 px-2.5 text-xs font-medium",
                  zoom === z
                    ? "bg-zinc-700/60 text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => onZoomChange(z)}
              >
                {z}
              </Button>
            ))}
          </div>

          {/* Separator */}
          <div className="hidden h-5 w-px bg-zinc-700/50 sm:block" />

          {/* Zone filter */}
          <div className="hidden items-center gap-1.5 sm:flex">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground">
                  {zoneLabels[zoneFilter]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-zinc-700 bg-zinc-900">
                {Object.entries(zoneLabels).map(([key, label]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => onZoneFilterChange(key)}
                    className={cn(
                      "text-foreground focus:bg-zinc-800 focus:text-foreground",
                      zoneFilter === key && "bg-zinc-800"
                    )}
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Ghost blocks toggle */}
        <div className="flex items-center gap-2">
          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Ghost Blocks</span>
          <Switch
            checked={showGhosts}
            onCheckedChange={onShowGhostsChange}
            className="data-[state=checked]:bg-emerald-600"
            aria-label="Toggle ghost blocks"
          />
        </div>
      </div>

      {/* Mobile: Service + time row */}
      <div className="flex items-center justify-between border-t border-zinc-800/50 px-4 py-2 md:hidden">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="h-3 w-3 text-emerald-400" />
          <span className="font-medium text-foreground">Fri, Jan 17</span>
          <span>Dinner</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="tabular-nums font-mono text-foreground">{formatTime(currentTime)}</span>
        </div>
      </div>

      {/* Mobile FAB */}
      <Button
        size="icon"
        className="fixed bottom-20 right-4 z-50 h-12 w-12 rounded-full bg-emerald-600 shadow-lg shadow-emerald-900/40 hover:bg-emerald-500 md:hidden"
        aria-label="New Reservation"
      >
        <Plus className="h-5 w-5 text-emerald-50" />
      </Button>
    </header>
  )
}
