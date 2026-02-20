"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, MessageSquare, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Wave, WaveItem } from "@/lib/fire-control-data"
import { waveStatusConfig, itemStatusConfig, dietaryIcons, minutesAgo, formatCurrency } from "@/lib/fire-control-data"
import { cn } from "@/lib/utils"

interface WaveCardProps {
  wave: Wave
  onFire: (wave: Wave) => void
  onMarkServed: (wave: Wave) => void
  onRush: (wave: Wave) => void
  onMessage: (wave: Wave) => void
}

export function WaveCard({ wave, onFire, onMarkServed, onRush, onMessage }: WaveCardProps) {
  const [mounted, setMounted] = useState(false)
  const [expanded, setExpanded] = useState(wave.status !== "served")

  useEffect(() => {
    setMounted(true)
  }, [])

  const config = waveStatusConfig[wave.status]
  const isServed = wave.status === "served"
  const isReady = wave.status === "ready"
  const isPreparing = wave.status === "preparing"
  const isHeld = wave.status === "held"

  let timeText = ""
  if (mounted) {
    if (wave.servedAt) {
      timeText = `Served ${minutesAgo(wave.servedAt)}m ago`
    } else if (wave.startedAt) {
      const elapsed = minutesAgo(wave.startedAt)
      if (wave.eta) {
        timeText = `Started ${elapsed}m ago · ETA ~${wave.eta} min`
      } else {
        timeText = `Started ${elapsed}m ago`
      }
    } else {
      timeText = "Waiting to be fired"
    }
  }

  return (
    <div
      className={cn(
        "rounded-xl border-l-4 bg-card shadow-sm transition-all",
        isServed && "border-l-green-500",
        isReady && "animate-pulse border-l-red-500 bg-red-500/5",
        isPreparing && "border-l-yellow-500",
        wave.status === "fired" && "border-l-orange-500",
        isHeld && "border-l-gray-400"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 p-4 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{wave.icon}</span>
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wide">{wave.label} Wave</h3>
          </div>
        </div>
        <Badge
          variant="secondary"
          className={cn(
            "gap-1.5 text-xs font-semibold uppercase",
            isServed && "bg-green-500/15 text-green-700 dark:text-green-400",
            isReady && "bg-red-500/15 text-red-700 dark:text-red-400",
            isPreparing && "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
            wave.status === "fired" && "bg-orange-500/15 text-orange-700 dark:text-orange-400",
            isHeld && "bg-gray-500/15 text-gray-700 dark:text-gray-400"
          )}
        >
          {config.icon} {config.label}
        </Badge>
      </div>

      <div className="border-t" />

      {/* Time & Progress */}
      <div className="flex items-center justify-between px-4 py-3 text-sm">
        <span className="text-muted-foreground">{timeText}</span>
        <span className="font-medium">
          {wave.itemsReady}/{wave.itemsTotal} items {isReady ? "ready" : isServed ? "delivered" : ""}
        </span>
      </div>

      {/* Ready Alert */}
      {isReady && (
        <>
          <div className="border-t" />
          <div className="bg-red-500/10 px-4 py-3">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">
              ⚠️ PICKUP NOW — Food getting cold!
            </p>
          </div>
        </>
      )}

      <div className="border-t" />

      {/* Items Section */}
      <div className="px-4 py-3">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mb-2 flex w-full items-center justify-between text-sm font-medium"
        >
          <span>ITEMS</span>
          {isServed ? (
            expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )
          ) : null}
        </button>

        {/* Collapsed view for served */}
        {isServed && !expanded && (
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {wave.items.map((item, idx) => (
              <span key={item.id}>
                ✅ {item.name} (Seat {item.seat})
                {idx < wave.items.length - 1 ? " ·" : ""}
              </span>
            ))}
          </div>
        )}

        {/* Expanded view */}
        {(expanded || !isServed) && (
          <div className="space-y-2">
            {wave.items.map((item) => (
              <WaveItemRow key={item.id} item={item} waveStatus={wave.status} />
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {(isPreparing || isReady) && (
        <>
          <div className="border-t" />
          <div className="flex items-center justify-end gap-2 px-4 py-3">
            <Button variant="outline" size="sm" onClick={() => onMessage(wave)} className="gap-1.5">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Message Kitchen</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => onRush(wave)} className="gap-1.5">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Rush Wave</span>
            </Button>
          </div>
        </>
      )}

      {/* Ready: Mark Served */}
      {isReady && (
        <>
          <div className="border-t" />
          <div className="p-4">
            <Button
              size="lg"
              className="w-full bg-green-600 text-base font-bold hover:bg-green-700"
              onClick={() => onMarkServed(wave)}
            >
              ✅ MARK AS SERVED
            </Button>
          </div>
        </>
      )}

      {/* Held: Fire Button */}
      {isHeld && (
        <>
          <div className="border-t" />
          <div className="p-4">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-base font-bold text-white hover:from-orange-600 hover:to-red-600"
              onClick={() => onFire(wave)}
            >
              🔥 FIRE {wave.label.toUpperCase()} WAVE
              <div className="mt-0.5 text-xs font-normal opacity-90">Sends to kitchen now</div>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

function WaveItemRow({ item, waveStatus }: { item: WaveItem; waveStatus: string }) {
  const config = itemStatusConfig[item.status]
  const isHeld = item.status === "held"

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-3 transition-colors",
        isHeld && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-base">{config.icon}</span>
            <span className="font-medium">
              {item.name}
              {item.variant && <span className="text-muted-foreground"> ({item.variant})</span>}
            </span>
          </div>
          {item.mods && item.mods.length > 0 && (
            <div className="mt-1 space-y-0.5">
              {item.mods.map((mod, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "text-sm text-muted-foreground",
                    mod.includes("ALLERGY") && "font-semibold text-red-600 dark:text-red-400"
                  )}
                >
                  {mod}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2 text-sm">
          <span className="text-muted-foreground">
            Seat {item.seat}
            {item.seatAllergy && ` ${dietaryIcons[item.seatAllergy]}`}
            {item.seatNote && ` ${item.seatNote}`}
          </span>
          {item.eta ? (
            <Badge variant="secondary" className="bg-yellow-500/15 text-yellow-700 dark:text-yellow-400">
              ~{item.eta} min
            </Badge>
          ) : item.price ? (
            <span className="font-medium">{formatCurrency(item.price)}</span>
          ) : (
            <Badge variant="secondary" className="bg-green-500/15 text-green-700 dark:text-green-400">
              {config.label}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
