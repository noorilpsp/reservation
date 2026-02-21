"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  MoreHorizontal,
  UtensilsCrossed,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  type TimelineBlock,
  type GhostBlock,
  type ZoomLevel,
  zones,
  tableLanes,
  getBlocksForTable,
  getGhostsForTable,
  getMergedForTable,
  getBlockColor,
  getRiskDot,
  getStatusLabel,
  formatTime24h,
} from "@/lib/timeline-data"

interface TimelineMobileProps {
  zoneFilter: string
  onZoneFilterChange: (zone: string) => void
  showGhosts: boolean
  onBlockClick: (block: TimelineBlock) => void
  serviceStart: string
  serviceEnd: string
}

export function TimelineMobile({
  zoneFilter,
  onZoneFilterChange,
  showGhosts,
  onBlockClick,
  serviceStart,
  serviceEnd,
}: TimelineMobileProps) {
  const toMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number)
    return h * 60 + m
  }
  const serviceStartMin = toMinutes(serviceStart)
  let serviceEndMin = toMinutes(serviceEnd)
  if (serviceEndMin <= serviceStartMin) serviceEndMin += 24 * 60
  const normalize = (min: number) => (min < serviceStartMin ? min + 24 * 60 : min)
  const overlapsService = (start: string, end: string) => {
    const startMin = normalize(toMinutes(start))
    const endMin = normalize(toMinutes(end))
    return startMin < serviceEndMin && endMin > serviceStartMin
  }

  const filteredTables = zoneFilter === "all"
    ? tableLanes
    : tableLanes.filter((t) => t.zone === zoneFilter)

  const [currentIndex, setCurrentIndex] = useState(0)
  const touchStart = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentTable = filteredTables[currentIndex]
  if (!currentTable) return null

  const blocks = getBlocksForTable(currentTable.id).filter((block) =>
    overlapsService(block.startTime, block.endTime)
  ).sort((a, b) => {
    const aMin = parseInt(a.startTime.split(":")[0]) * 60 + parseInt(a.startTime.split(":")[1])
    const bMin = parseInt(b.startTime.split(":")[0]) * 60 + parseInt(b.startTime.split(":")[1])
    return aMin - bMin
  })
  const ghosts = showGhosts
    ? getGhostsForTable(currentTable.id).filter((ghost) =>
      overlapsService(ghost.predictedTime, ghost.endTime)
    )
    : []
  const mergedRaw = getMergedForTable(currentTable.id)
  const merged = mergedRaw && overlapsService(mergedRaw.startTime, mergedRaw.endTime) ? mergedRaw : null
  const zoneName = zones.find((z) => z.id === currentTable.zone)?.name ?? ""

  const goPrev = () => setCurrentIndex((i) => Math.max(0, i - 1))
  const goNext = () => setCurrentIndex((i) => Math.min(filteredTables.length - 1, i + 1))

  // Swipe detection
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return
    const diff = e.changedTouches[0].clientX - touchStart.current
    if (Math.abs(diff) > 50) {
      if (diff > 0) goPrev()
      else goNext()
    }
    touchStart.current = null
  }

  return (
    <div
      ref={containerRef}
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Table navigator */}
      <div className="flex items-center justify-between border-b border-zinc-800/50 px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={goPrev}
          disabled={currentIndex === 0}
          aria-label="Previous table"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">
            {currentTable.label} ({currentTable.seats}-top)
          </p>
          <p className="text-[10px] text-muted-foreground">{zoneName}</p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={goNext}
          disabled={currentIndex === filteredTables.length - 1}
          aria-label="Next table"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Table indicator dots */}
      <div className="flex justify-center gap-1 py-2">
        {filteredTables.slice(
          Math.max(0, currentIndex - 4),
          Math.min(filteredTables.length, currentIndex + 5)
        ).map((t, i) => {
          const realIndex = Math.max(0, currentIndex - 4) + i
          return (
            <button
              key={t.id}
              type="button"
              className={cn(
                "h-1.5 rounded-full transition-all",
                realIndex === currentIndex
                  ? "w-4 bg-cyan-400"
                  : "w-1.5 bg-zinc-700"
              )}
              onClick={() => setCurrentIndex(realIndex)}
              aria-label={`Go to ${t.label}`}
            />
          )
        })}
      </div>

      {/* Reservation cards */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-24 pt-2">
        {/* Merged indicator */}
        {merged && (
          <div className="rounded-lg border border-dashed border-zinc-700/50 bg-zinc-800/20 px-4 py-3 text-center">
            <span className="text-xs text-zinc-500">MERGED WITH {merged.mergedWith}</span>
            <p className="mt-0.5 text-[10px] text-zinc-600">
              {formatTime24h(merged.startTime)} - {formatTime24h(merged.endTime)}
            </p>
          </div>
        )}

        {blocks.map((block) => {
          const colors = getBlockColor(block.status)
          const statusLabel = getStatusLabel(block)
          const isPast = block.status === "completed"

          return (
            <button
              key={block.id}
              type="button"
              className={cn(
                "tl-block w-full rounded-lg border-l-[3px] p-4 text-left backdrop-blur-sm",
                colors.bg,
                colors.border,
                isPast && "opacity-50"
              )}
              onClick={() => onBlockClick(block)}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-semibold",
                      isPast ? "text-zinc-400 line-through" : "text-foreground"
                    )}>
                      {block.guestName} ({block.partySize})
                    </span>
                    <span className={cn("h-2 w-2 rounded-full", getRiskDot(block.risk))} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatTime24h(block.startTime)} - {formatTime24h(block.endTime)}
                  </p>
                  <p className={cn("text-xs", colors.text)}>
                    {statusLabel}{isPast && " \u2713"}
                  </p>
                </div>

                {block.risk === "high" && block.riskScore && (
                  <Badge className="bg-rose-600 text-[10px] text-rose-50 border-none">
                    {block.riskScore}%
                  </Badge>
                )}
              </div>

              {/* Tags */}
              {block.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {block.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="border-zinc-700 text-[10px] text-zinc-300">
                      {tag.label}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Merge label */}
              {block.mergedWith && (
                <div className="mt-2">
                  <Badge variant="outline" className="border-zinc-600 text-[10px] text-zinc-400">
                    {block.table}+{block.mergedWith} MERGED
                  </Badge>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-3 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 border-zinc-700 bg-zinc-800/40 px-2.5 text-[11px] text-foreground hover:bg-zinc-700/60"
                  onClick={(e) => { e.stopPropagation() }}
                >
                  <UtensilsCrossed className="mr-1 h-3 w-3" />
                  Seat
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 border-zinc-700 bg-zinc-800/40 px-2.5 text-[11px] text-foreground hover:bg-zinc-700/60"
                  onClick={(e) => { e.stopPropagation() }}
                >
                  <MessageSquare className="mr-1 h-3 w-3" />
                  Text
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 border-zinc-700 bg-zinc-800/40 px-2 text-foreground hover:bg-zinc-700/60"
                      onClick={(e) => { e.stopPropagation() }}
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="border-zinc-700 bg-zinc-900">
                    <DropdownMenuItem className="text-foreground focus:bg-zinc-800">Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-foreground focus:bg-zinc-800">Assign Server</DropdownMenuItem>
                    <DropdownMenuItem className="text-foreground focus:bg-zinc-800">Move to Waitlist</DropdownMenuItem>
                    <DropdownMenuItem className="text-rose-400 focus:bg-zinc-800">Cancel</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </button>
          )
        })}

        {/* Ghost blocks */}
        {ghosts.map((ghost) => (
          <div
            key={ghost.id}
            className="tl-ghost-block rounded-lg border border-dashed border-zinc-600/40 bg-zinc-600/10 p-4"
          >
            <p className="text-xs text-zinc-500">
              {formatTime24h(ghost.predictedTime)} - open
            </p>
            <p className="text-sm text-zinc-400">{ghost.label}</p>
            {ghost.conditional && (
              <p className="text-[10px] text-zinc-600">({ghost.conditional})</p>
            )}
            <Button
              variant="outline"
              size="sm"
              className="mt-2 h-7 border-emerald-700/50 bg-emerald-900/20 px-3 text-[11px] text-emerald-400 hover:bg-emerald-900/30"
            >
              Book This Slot
            </Button>
          </div>
        ))}

        {/* Empty state */}
        {blocks.length === 0 && ghosts.length === 0 && !merged && (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No reservations for this table</p>
            <p className="text-xs text-zinc-600">Table is open all evening</p>
          </div>
        )}

        {blocks.length > 0 && (
          <div className="py-6 text-center">
            <p className="text-xs text-zinc-600">No more reservations</p>
          </div>
        )}
      </div>
    </div>
  )
}
