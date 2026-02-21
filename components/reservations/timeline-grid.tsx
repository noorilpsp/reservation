"use client"

import { useCallback, useState, useEffect, useMemo } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import {
  TooltipProvider,
} from "@/components/ui/tooltip"
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
} from "@/lib/timeline-data"
import { ReservationBlock, GhostBlockComponent, MergedBlockComponent } from "./timeline-block"

interface TimelineGridProps {
  zoom: ZoomLevel
  zoneFilter: string
  showGhosts: boolean
  onScrollChange: (scrollLeft: number) => void
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
  onBlockClick: (block: TBlock) => void
  onEmptySlotClick: (payload: { tableId: string; time: string; duration: number; durationMax: number; partySize: number }) => void
  serviceStart: string
  serviceEnd: string
  nowTime: string | null
}

const LANE_HEIGHT = 56
const ZONE_HEADER_HEIGHT = 32
const TIME_HEADER_HEIGHT = 28

export function TimelineGrid({
  zoom,
  zoneFilter,
  showGhosts,
  onScrollChange,
  scrollContainerRef,
  onBlockClick,
  onEmptySlotClick,
  serviceStart,
  serviceEnd,
  nowTime,
}: TimelineGridProps) {
  const [collapsedZones, setCollapsedZones] = useState<Set<string>>(new Set())
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportWidth, setViewportWidth] = useState(0)
  const [hoveredSlot, setHoveredSlot] = useState<{ tableId: string; index: number } | null>(null)
  const [activeSlot, setActiveSlot] = useState<{ tableId: string; index: number } | null>(null)

  const toMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number)
    return h * 60 + m
  }
  const toTime24 = (totalMinutes: number) => {
    const normalized = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60)
    const h = Math.floor(normalized / 60).toString().padStart(2, "0")
    const m = (normalized % 60).toString().padStart(2, "0")
    return `${h}:${m}`
  }

  const timeLabels = getTimeLabels(zoom, serviceStart, serviceEnd)
  const columnCount = Math.max(1, timeLabels.length)
  const slotMinutes = zoom === "1hr" ? 60 : zoom === "30min" ? 30 : 15
  const clickSlotMinutes = zoom === "1hr" ? 15 : slotMinutes
  const subSlotsPerColumn = zoom === "1hr" ? 4 : 1
  const minSlotWidth = zoom === "1hr" ? 60 : zoom === "30min" ? 46 : 34
  const baseSlotWidth = getSlotWidth(zoom)
  const adaptiveBaseWidth = viewportWidth > 0 ? viewportWidth : columnCount * baseSlotWidth
  const slotWidth = Math.max(minSlotWidth, adaptiveBaseWidth / columnCount)
  const subSlotWidth = slotWidth / subSlotsPerColumn
  const totalWidth = Math.max(adaptiveBaseWidth, columnCount * slotWidth)
  const serviceStartMin = toMinutes(serviceStart)
  let serviceEndMin = toMinutes(serviceEnd)
  if (serviceEndMin <= serviceStartMin) serviceEndMin += 24 * 60
  const normalize = (min: number) => (min < serviceStartMin ? min + 24 * 60 : min)
  const getSubSlotIndex = (clickX: number) => {
    const totalSubSlots = timeLabels.length * subSlotsPerColumn
    return Math.max(
      0,
      Math.min(totalSubSlots - 1, Math.floor(clickX / subSlotWidth))
    )
  }
  const nowPixel = useMemo(() => {
    if (!nowTime) return null
    let nowMin = toMinutes(nowTime)
    if (nowMin < serviceStartMin) nowMin += 24 * 60
    if (nowMin < serviceStartMin || nowMin > serviceEndMin) return null
    return ((nowMin - serviceStartMin) / slotMinutes) * slotWidth
  }, [nowTime, serviceEndMin, serviceStartMin, slotMinutes, slotWidth])
  const overlapsService = (start: string, end: string) => {
    const startMin = normalize(toMinutes(start))
    const endMin = normalize(toMinutes(end))
    return startMin < serviceEndMin && endMin > serviceStartMin
  }

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
      setScrollTop(scrollContainerRef.current.scrollTop)
    }
  }, [onScrollChange, scrollContainerRef])

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const syncWidth = () => setViewportWidth(el.clientWidth)
    syncWidth()

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => syncWidth())
      observer.observe(el)
      return () => observer.disconnect()
    }

    window.addEventListener("resize", syncWidth)
    return () => window.removeEventListener("resize", syncWidth)
  }, [scrollContainerRef])

  // Scroll to NOW on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      if (nowPixel === null) {
        scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" })
        return
      }
      const target = nowPixel - scrollContainerRef.current.clientWidth / 3
      scrollContainerRef.current.scrollTo({ left: Math.max(0, target), behavior: "smooth" })
    }
  }, [zoom, nowPixel, scrollContainerRef])

  const filteredZones = zoneFilter === "all" ? zones : zones.filter(z => z.id === zoneFilter)

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex h-full flex-1 min-h-0">
        {/* Left sidebar: table labels */}
        <div className="hidden w-[140px] shrink-0 border-r border-zinc-800/50 lg:flex lg:flex-col">
          <div
            className="flex items-center border-b border-zinc-800/40 bg-zinc-950/90 px-3"
            style={{ height: TIME_HEADER_HEIGHT }}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Tables
            </span>
          </div>

          <div className="relative min-h-0 flex-1 overflow-hidden">
            <div style={{ transform: `translateY(-${scrollTop}px)` }}>
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
          </div>
        </div>

        {/* Main scrollable timeline area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-auto scrollbar-none"
          onScroll={handleScroll}
        >
          <div className="relative" style={{ width: totalWidth, minHeight: "100%" }}>
            {/* Time header */}
            <div
              className="sticky top-0 z-30 border-b border-zinc-800/40 bg-zinc-950/95 backdrop-blur-sm"
              style={{ height: TIME_HEADER_HEIGHT }}
            >
              {timeLabels.map((label, i) => (
                <div
                  key={`tl-${i}`}
                  className="absolute top-1.5 text-[10px] tabular-nums text-muted-foreground"
                  style={{ left: i * slotWidth }}
                >
                  <span className="whitespace-nowrap">{label}</span>
                </div>
              ))}
            </div>

            {/* Vertical grid lines */}
            {timeLabels.map((_, i) => (
              <div
                key={`grid-${i}`}
                className="absolute border-l border-zinc-800/25"
                style={{ top: TIME_HEADER_HEIGHT, left: i * slotWidth, height: `calc(100% - ${TIME_HEADER_HEIGHT}px)` }}
              />
            ))}
            {zoom === "1hr" && Array.from({ length: timeLabels.length * 4 - 1 }, (_, i) => i + 1)
              .filter((i) => i % 4 !== 0)
              .map((i) => (
                <div
                  key={`sub-grid-${i}`}
                  className="absolute border-l border-zinc-800/15"
                  style={{ top: TIME_HEADER_HEIGHT, left: i * subSlotWidth, height: `calc(100% - ${TIME_HEADER_HEIGHT}px)` }}
                />
              ))}

            {/* NOW line - full height */}
            {nowPixel !== null && (
              <div
                className="tl-now-line absolute z-20 pointer-events-none"
                style={{ top: TIME_HEADER_HEIGHT, left: nowPixel, height: `calc(100% - ${TIME_HEADER_HEIGHT}px)` }}
              >
                <div className="flex h-full flex-col items-center">
                  <div className="h-full w-0.5 bg-cyan-400/50 shadow-[0_0_8px_2px_rgba(34,211,238,0.25)]" />
                </div>
              </div>
            )}

            {/* Past overlay */}
            {nowPixel !== null && (
              <div
                className="absolute bg-zinc-950/20 pointer-events-none"
                style={{ top: TIME_HEADER_HEIGHT, left: 0, width: nowPixel, height: `calc(100% - ${TIME_HEADER_HEIGHT}px)` }}
              />
            )}

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
                    const blocks = getBlocksForTable(table.id).filter((block) =>
                      overlapsService(block.startTime, block.endTime)
                    )
                    const ghosts = getGhostsForTable(table.id).filter((ghost) =>
                      overlapsService(ghost.predictedTime, ghost.endTime)
                    )
                    const mergedRaw = getMergedForTable(table.id)
                    const merged = mergedRaw && overlapsService(mergedRaw.startTime, mergedRaw.endTime) ? mergedRaw : null

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

                        {/* Per-slot hover / active highlight */}
                        {(hoveredSlot?.tableId === table.id || activeSlot?.tableId === table.id) && (
                          <>
                            {activeSlot?.tableId === table.id && (
                              <div
                                className="absolute inset-y-0 bg-cyan-400/15 ring-1 ring-cyan-300/40 pointer-events-none"
                                style={{
                                  left: activeSlot.index * subSlotWidth,
                                  width: subSlotWidth,
                                }}
                              />
                            )}
                            {hoveredSlot?.tableId === table.id && (
                              <div
                                className="absolute inset-y-0 bg-emerald-400/10 ring-1 ring-emerald-300/35 pointer-events-none"
                                style={{
                                  left: hoveredSlot.index * subSlotWidth,
                                  width: subSlotWidth,
                                }}
                              />
                            )}
                          </>
                        )}

                        {/* Hover highlight for empty areas */}
                        <div
                          className="absolute inset-0 cursor-cell hover:bg-emerald-500/[0.03] transition-colors duration-150"
                          onMouseMove={(event) => {
                            const rect = event.currentTarget.getBoundingClientRect()
                            const clickX = event.clientX - rect.left
                            setHoveredSlot({ tableId: table.id, index: getSubSlotIndex(clickX) })
                          }}
                          onMouseLeave={() => {
                            setHoveredSlot((prev) => (prev?.tableId === table.id ? null : prev))
                          }}
                          onClick={(event) => {
                            const rect = event.currentTarget.getBoundingClientRect()
                            const clickX = event.clientX - rect.left
                            const subSlotIndex = getSubSlotIndex(clickX)
                            setActiveSlot({ tableId: table.id, index: subSlotIndex })
                            const selectedTime = toTime24(serviceStartMin + subSlotIndex * clickSlotMinutes)
                            const selectedMin = normalize(toMinutes(selectedTime))
                            const nextBlockStartMin = blocks
                              .map((block) => normalize(toMinutes(block.startTime)))
                              .filter((startMin) => startMin > selectedMin)
                              .sort((a, b) => a - b)[0]
                            const boundaryMin = Math.min(nextBlockStartMin ?? serviceEndMin, serviceEndMin)
                            const rawAvailable = Math.max(15, boundaryMin - selectedMin)
                            const roundedAvailable = Math.max(15, Math.floor(rawAvailable / 15) * 15)
                            const defaultDuration = Math.min(90, roundedAvailable)

                            onEmptySlotClick({
                              tableId: table.id,
                              time: selectedTime,
                              duration: defaultDuration,
                              durationMax: roundedAvailable,
                              partySize: table.seats,
                            })
                          }}
                          aria-label={`Create reservation on ${table.label}`}
                        />

                        {/* Merged block indicator */}
                        {merged && (
                          <MergedBlockComponent
                            merged={merged}
                            zoom={zoom}
                            axisStart={serviceStart}
                            slotWidth={slotWidth}
                          />
                        )}

                        {/* Reservation blocks */}
                        {blocks.map((block) => (
                          <ReservationBlock
                            key={block.id}
                            block={block}
                            zoom={zoom}
                            slotWidth={slotWidth}
                            onClick={onBlockClick}
                            axisStart={serviceStart}
                          />
                        ))}

                        {/* Ghost blocks */}
                        {showGhosts && ghosts.map((ghost) => (
                          <GhostBlockComponent
                            key={ghost.id}
                            ghost={ghost}
                            zoom={zoom}
                            slotWidth={slotWidth}
                            axisStart={serviceStart}
                          />
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
