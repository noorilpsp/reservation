"use client"

import { useState, useEffect } from "react"
import type { Wave } from "@/lib/fire-control-data"
import { waveStatusConfig, minutesAgo } from "@/lib/fire-control-data"
import { cn } from "@/lib/utils"

interface WaveProgressTimelineProps {
  waves: Wave[]
}

export function WaveProgressTimeline({ waves }: WaveProgressTimelineProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="border-b bg-card px-4 py-6">
      <div className="mx-auto max-w-4xl">
        {/* Timeline container */}
        <div className="relative flex items-center justify-between">
          {/* Connection line */}
          <div className="absolute left-0 right-0 top-5 h-0.5 bg-border" />

          {/* Wave nodes */}
          {waves.map((wave, idx) => {
            const config = waveStatusConfig[wave.status]
            const isComplete = wave.status === "served"
            const isActive = wave.status === "preparing" || wave.status === "ready"
            const isFuture = wave.status === "held"

            let timeText = ""
            if (mounted) {
              if (wave.servedAt) {
                timeText = `${minutesAgo(wave.servedAt)}m ago`
              } else if (wave.startedAt) {
                if (wave.eta) {
                  timeText = `~${wave.eta} min left`
                } else {
                  timeText = `${minutesAgo(wave.startedAt)}m ago`
                }
              } else if (wave.status === "held") {
                timeText = "Tap to fire"
              }
            }

            return (
              <div key={wave.id} className="relative z-10 flex flex-1 flex-col items-center gap-2">
                {/* Node */}
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-4 bg-card text-lg transition-all",
                    isComplete && "border-green-500",
                    isActive && wave.status === "ready" && "animate-pulse border-red-500",
                    isActive && wave.status === "preparing" && "border-yellow-500",
                    wave.status === "fired" && "border-orange-500",
                    isFuture && "border-gray-300 dark:border-gray-700"
                  )}
                >
                  {config.icon}
                </div>

                {/* Label */}
                <div className="flex flex-col items-center gap-0.5 text-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium uppercase tracking-wide">{wave.label}</span>
                    <span
                      className={cn(
                        "text-xs font-semibold uppercase",
                        isComplete && "text-green-600 dark:text-green-500",
                        wave.status === "ready" && "text-red-600 dark:text-red-500",
                        wave.status === "preparing" && "text-yellow-600 dark:text-yellow-500",
                        wave.status === "fired" && "text-orange-600 dark:text-orange-500",
                        isFuture && "text-muted-foreground"
                      )}
                    >
                      {config.label}
                    </span>
                  </div>
                  {timeText && (
                    <span className="text-xs text-muted-foreground">{timeText}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
