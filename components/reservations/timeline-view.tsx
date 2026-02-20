"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { type ZoomLevel, type TimelineBlock, getSlotWidth } from "@/lib/timeline-data"
import { TimelineTopBar } from "./timeline-top-bar"
import { TimelineCapacityStrip } from "./timeline-capacity-strip"
import { TimelineGrid } from "./timeline-grid"
import { TimelineDetailPanel } from "./timeline-detail-panel"
import { TimelineMobile } from "./timeline-mobile"

export function TimelineView() {
  const [zoom, setZoom] = useState<ZoomLevel>("30min")
  const [zoneFilter, setZoneFilter] = useState("all")
  const [showGhosts, setShowGhosts] = useState(true)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [selectedBlock, setSelectedBlock] = useState<TimelineBlock | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery("(max-width: 767px)")

  const handleBlockClick = useCallback((block: TimelineBlock) => {
    setSelectedBlock(block)
    setDetailOpen(true)
  }, [])

  const handleSlotClick = useCallback((slotIndex: number) => {
    if (scrollContainerRef.current) {
      const slotWidth = getSlotWidth(zoom)
      const targetLeft = slotIndex * slotWidth - scrollContainerRef.current.clientWidth / 2 + slotWidth / 2
      scrollContainerRef.current.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" })
    }
  }, [zoom])

  const handleScrollChange = useCallback((sl: number) => {
    setScrollLeft(sl)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      switch (e.key.toLowerCase()) {
        case "g":
          setShowGhosts((v) => !v)
          break
        case "n":
          // New reservation placeholder
          break
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="flex h-full flex-col">
      <TimelineTopBar
        zoom={zoom}
        onZoomChange={setZoom}
        zoneFilter={zoneFilter}
        onZoneFilterChange={setZoneFilter}
        showGhosts={showGhosts}
        onShowGhostsChange={setShowGhosts}
      />

      {isMobile ? (
        <TimelineMobile
          zoneFilter={zoneFilter}
          onZoneFilterChange={setZoneFilter}
          showGhosts={showGhosts}
          onBlockClick={handleBlockClick}
        />
      ) : (
        <>
          <TimelineCapacityStrip
            zoom={zoom}
            scrollLeft={scrollLeft}
            onSlotClick={handleSlotClick}
          />
          <TimelineGrid
            zoom={zoom}
            zoneFilter={zoneFilter}
            showGhosts={showGhosts}
            onScrollChange={handleScrollChange}
            scrollContainerRef={scrollContainerRef}
            onBlockClick={handleBlockClick}
          />
        </>
      )}

      <TimelineDetailPanel
        block={selectedBlock}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  )
}
