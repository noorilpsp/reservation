"use client"

import { useRef, useCallback, useState, useEffect } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import {
  TooltipProvider,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  type ZoomLevel,
  type TimelineBlock as TBlock,
  zones,
  getTablesForZone,
  getBlocksForTable,
  getGhostsForTable,
  getMergedForTable,
  getTimeLabels,
  getSlotWidth,
  getNowPixel,
  NOW_LABEL,
  timeToOffset,
} from "@/lib/timeline-data"
import { ReservationBlock, GhostBlockComponent, MergedBlockComponent } from "./timeline-block"

interface TimelineGridProps {
  zoom: ZoomLevel
  zoneFilter: string
  showGhosts: boolean
  onScrollChange: (scrollLeft: number) => void
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
  onBlockClick: (block: TBlock) => void
}

const LANE_HEIGHT = 56
const ZONE_HEADER_HEIGHT = 32

export function TimelineGrid({
  zoom,
  zoneFilter,
  showGhosts,
  onScrollChange,
  scrollContainerRef,
  onBlockClick,
}: TimelineGridProps) {
  const [collapsedZones, setCollapsedZones] = useState<Set<string>>(new Set())

  const slotWidth = getSlotWidth(zoom)
  const timeLabels = getTimeLabels(zoom)
  const totalWidth = timeLabels.length * slotWidth
  const nowPixel = getNowPixel(zoom)

  // Nowline offset from dinner start
  const nowOffset = timeToOffset("19:23")

  const toggleZone = (zoneId: string) => {
    setCollapsedZones((prev) => {
      const next = new Set(prev)
      if (next.has(zoneId)) next.delete(zoneId)
      else next.add(zoneId)
      return next
    })
  }

  // Handle scroll sync
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      onScrollChange(scrollContainerRef.current.scrollLeft)
    }
  }, [onScrollChange, scrollContainerRef])

  // Scroll to NOW on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const target = nowPixel - scrollContainerRef.current.clientWidth / 3
      scrollContainerRef.current.scrollTo({ left: Math.max(0, target), behavior: "smooth" })
    }
  }, [zoom, nowPixel, scrollContainerRef])

  const filteredZones = zoneFilter === "all" ? zones : zones.filter(z => z.id === zoneFilter)

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex flex-1 min-h-0">
        {/* Left sidebar: table labels */}
        <div className="hidden w-[140px] shrink-0 border-r border-zinc-800/50 lg:block">
          {filteredZones.map((zone) => {
            const tables = getTablesForZone(zone.id)
            const isCollapsed = collapsedZones.has(zone.id)

            return (
              <div key={zone.id}>
                {/* Zone header */}
                <button
                  type="button"
                  className="flex w-full items-center gap-1.5 border-b border-zinc-800/30 bg-zinc-900/50 px-3"
                  style={{ height: ZONE_HEADER_HEIGHT }}
                  onClick={() => toggleZone(zone.id)}
                  aria-expanded={!isCollapsed}
                  aria-label={`${zone.name} zone, ${isCollapsed ? "collapsed" : "expanded"}`}
                >
                  {isCollapsed
                    ? <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {zone.name}
                  </span>
                </button>

                {/* Table rows */}
                {!isCollapsed && tables.map((table) => (
                  <div
                    key={table.id}
                    className="flex items-center border-b border-zinc-800/20 px-3"
                    style={{ height: LANE_HEIGHT }}
                  >
                    <span className="text-xs font-semibold text-foreground">{table.label}</span>
                    <span className="ml-1.5 text-[10px] text-muted-foreground">{table.seats}p</span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        {/* Main scrollable timeline area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-auto scrollbar-none"
          onScroll={handleScroll}
        >
          <div className="relative" style={{ width: totalWidth, minHeight: "100%" }}>
            {/* Vertical grid lines */}
            {timeLabels.map((_, i) => (
              <div
                key={`grid-${i}`}
                className="absolute top-0 h-full border-l border-zinc-800/25"
                style={{ left: i * slotWidth }}
              />
            ))}

            {/* NOW line - full height */}
            <div
              className="tl-now-line absolute top-0 z-20 h-full pointer-events-none"
              style={{ left: nowPixel }}
            >
              <div className="flex h-full flex-col items-center">
                <div className="h-full w-0.5 bg-cyan-400/50 shadow-[0_0_8px_2px_rgba(34,211,238,0.25)]" />
              </div>
            </div>

            {/* Past overlay */}
            <div
              className="absolute top-0 h-full bg-zinc-950/20 pointer-events-none"
              style={{ left: 0, width: nowPixel }}
            />

            {/* Zone + table lanes */}
            {filteredZones.map((zone) => {
              const tables = getTablesForZone(zone.id)
              const isCollapsed = collapsedZones.has(zone.id)

              return (
                <div key={zone.id}>
                  {/* Zone header row */}
                  <div
                    className="flex items-center border-b border-zinc-800/30 bg-zinc-900/30 px-4 lg:px-0"
                    style={{ height: ZONE_HEADER_HEIGHT }}
                  >
                    {/* Mobile zone label (hidden on desktop since sidebar shows it) */}
                    <button
                      type="button"
                      className="flex items-center gap-1.5 lg:hidden"
                      onClick={() => toggleZone(zone.id)}
                    >
                      {isCollapsed
                        ? <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {zone.name}
                      </span>
                    </button>
                  </div>

                  {/* Table lanes */}
                  {!isCollapsed && tables.map((table) => {
                    const blocks = getBlocksForTable(table.id)
                    const ghosts = getGhostsForTable(table.id)
                    const merged = getMergedForTable(table.id)

                    return (
                      <div
                        key={table.id}
                        className="relative border-b border-zinc-800/20"
                        style={{ height: LANE_HEIGHT }}
                      >
                        {/* Mobile table label */}
                        <div className="absolute left-2 top-1 z-10 flex items-center gap-1 lg:hidden">
                          <span className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-[9px] font-bold text-foreground backdrop-blur-sm">
                            {table.label} {table.seats}p
                          </span>
                        </div>

                        {/* Hover highlight for empty areas */}
                        <div className="absolute inset-0 hover:bg-emerald-500/[0.03] transition-colors duration-150" />

                        {/* Merged block indicator */}
                        {merged && <MergedBlockComponent merged={merged} zoom={zoom} />}

                        {/* Reservation blocks */}
                        {blocks.map((block) => (
                          <ReservationBlock
                            key={block.id}
                            block={block}
                            zoom={zoom}
                            onClick={onBlockClick}
                          />
                        ))}

                        {/* Ghost blocks */}
                        {showGhosts && ghosts.map((ghost) => (
                          <GhostBlockComponent key={ghost.id} ghost={ghost} zoom={zoom} />
                        ))}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
