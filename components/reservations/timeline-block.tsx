"use client"

import { useRef, useState, useCallback } from "react"
import Link from "next/link"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  type TimelineBlock as TBlock,
  type GhostBlock,
  type MergedBlock,
  type ZoomLevel,
  getBlockColor,
  getRiskDot,
  getStatusLabel,
  formatTime12h,
  timeToOffset,
  offsetToPixel,
} from "@/lib/timeline-data"

// ── Reservation Block ────────────────────────────────────────────────────────

interface ReservationBlockProps {
  block: TBlock
  zoom: ZoomLevel
  onClick: (block: TBlock) => void
}

export function ReservationBlock({ block, zoom, onClick }: ReservationBlockProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const blockRef = useRef<HTMLDivElement>(null)
  const startPos = useRef({ x: 0, y: 0 })

  const startOff = timeToOffset(block.startTime)
  const endOff = timeToOffset(block.endTime)
  const leftPx = offsetToPixel(startOff, zoom)
  const widthPx = offsetToPixel(endOff - startOff, zoom)
  const colors = getBlockColor(block.status)
  const statusLabel = getStatusLabel(block)
  const isPast = block.status === "completed"
  const isLate = block.status === "late"

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    startPos.current = { x: e.clientX, y: e.clientY }
    setIsDragging(true)

    const handleMove = (ev: MouseEvent) => {
      setDragOffset({
        x: ev.clientX - startPos.current.x,
        y: ev.clientY - startPos.current.y,
      })
    }
    const handleUp = () => {
      setIsDragging(false)
      setDragOffset({ x: 0, y: 0 })
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("mouseup", handleUp)
    }
    window.addEventListener("mousemove", handleMove)
    window.addEventListener("mouseup", handleUp)
  }, [])

  // Tag icons
  const tagIcons = block.tags.map((t) => {
    switch (t.type) {
      case "vip":        return { symbol: "\u2605", color: "text-amber-400", label: t.label }
      case "allergy":    return { symbol: "\u26A0", color: "text-rose-400", label: t.label }
      case "birthday":   return { symbol: "\uD83C\uDF82", color: "text-pink-400", label: t.label }
      case "anniversary": return { symbol: "\uD83D\uDC8D", color: "text-purple-400", label: t.label }
      case "first-timer": return { symbol: "\u2726", color: "text-blue-400", label: t.label }
      default:           return { symbol: "\u25CF", color: "text-zinc-400", label: t.label }
    }
  })

  const mergeLabel = block.mergedWith ? `${block.table}+${block.mergedWith} MERGED` : null

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              ref={blockRef}
              role="button"
              tabIndex={0}
              className={cn(
                "tl-block absolute top-1 bottom-1 cursor-grab rounded-md border-l-[3px] backdrop-blur-sm",
                "transition-shadow duration-150",
                "hover:shadow-lg hover:shadow-black/30 hover:z-10",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950",
                colors.bg,
                colors.border,
                isPast && "opacity-50",
                isLate && "tl-pulse-late",
                isDragging && "cursor-grabbing shadow-2xl shadow-black/50 z-30 scale-[1.03] rotate-[1deg]"
              )}
              style={{
                left: leftPx,
                width: Math.max(widthPx, 40),
                transform: isDragging ? `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(1.03) rotate(1deg)` : undefined,
              }}
              onClick={() => onClick(block)}
              onMouseDown={handleDragStart}
              onKeyDown={(e) => { if (e.key === "Enter") onClick(block) }}
              aria-label={`${block.guestName}, party of ${block.partySize}, ${block.table}, ${formatTime12h(block.startTime)}, ${statusLabel}${block.tags.map(t => `, ${t.label}`).join("")}`}
            >
              <div className="flex h-full flex-col justify-between overflow-hidden px-2 py-1">
                {/* Top row: name, party size, risk dot */}
                <div className="flex items-center gap-1 min-w-0">
                  <span className={cn(
                    "truncate text-[11px] font-semibold leading-tight",
                    isPast ? "text-zinc-400 line-through" : "text-foreground"
                  )}>
                    {block.guestName}
                  </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    ({block.partySize})
                  </span>
                  <span className={cn("ml-auto h-2 w-2 shrink-0 rounded-full", getRiskDot(block.risk))} />
                </div>

                {/* Middle: status */}
                <div className="flex items-center gap-1 min-w-0">
                  <span className={cn("truncate text-[10px]", colors.text)}>
                    {statusLabel}
                    {isPast && " \u2713"}
                  </span>
                </div>

                {/* Bottom: tags + merge label */}
                {(tagIcons.length > 0 || mergeLabel) && (
                  <div className="flex items-center gap-1 min-w-0">
                    {tagIcons.map((t, i) => (
                      <span key={i} className={cn("text-[10px]", t.color)} title={t.label}>
                        {t.symbol}
                      </span>
                    ))}
                    {mergeLabel && (
                      <Badge variant="outline" className="h-4 border-zinc-600 px-1 text-[8px] text-zinc-400">
                        {mergeLabel}
                      </Badge>
                    )}
                  </div>
                )}

                {/* High risk badge */}
                {block.risk === "high" && block.riskScore && (
                  <div className="absolute -top-1.5 -right-1.5 z-10">
                    <Badge className="h-4 bg-rose-600 px-1 text-[8px] font-bold text-rose-50">
                      {block.riskScore}%
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[260px] border-zinc-700 bg-zinc-900 text-foreground">
            <div className="space-y-1 text-xs">
              <p className="font-semibold">{block.guestName} ({block.partySize})</p>
              <p>{block.table}{block.mergedWith ? ` + ${block.mergedWith}` : ""}</p>
              <p>{formatTime12h(block.startTime)} - {formatTime12h(block.endTime)}</p>
              <p className={colors.text}>{statusLabel}</p>
              {block.tags.map((t, i) => (
                <p key={i} className="text-muted-foreground">{t.label}{t.detail ? `: ${t.detail}` : ""}</p>
              ))}
              {block.notes && <p className="text-muted-foreground italic">{block.notes}</p>}
            </div>
          </TooltipContent>
        </Tooltip>
      </ContextMenuTrigger>
      <ContextMenuContent className="border-zinc-700 bg-zinc-900">
        <ContextMenuItem className="text-foreground focus:bg-zinc-800 focus:text-foreground">Seat Now</ContextMenuItem>
        <ContextMenuItem className="text-foreground focus:bg-zinc-800 focus:text-foreground">Text Guest</ContextMenuItem>
        <ContextMenuItem className="text-foreground focus:bg-zinc-800 focus:text-foreground">Assign Server</ContextMenuItem>
        <ContextMenuSeparator className="bg-zinc-800" />
        <ContextMenuItem className="text-foreground focus:bg-zinc-800 focus:text-foreground" asChild>
          <Link href="/reservations/edit">Edit Reservation</Link>
        </ContextMenuItem>
        <ContextMenuItem className="text-foreground focus:bg-zinc-800 focus:text-foreground">Move to Waitlist</ContextMenuItem>
        <ContextMenuSeparator className="bg-zinc-800" />
        <ContextMenuItem className="text-rose-400 focus:bg-zinc-800 focus:text-rose-400">Cancel</ContextMenuItem>
        <ContextMenuItem className="text-rose-400 focus:bg-zinc-800 focus:text-rose-400">No-Show</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

// ── Ghost Block ──────────────────────────────────────────────────────────────

interface GhostBlockComponentProps {
  ghost: GhostBlock
  zoom: ZoomLevel
}

export function GhostBlockComponent({ ghost, zoom }: GhostBlockComponentProps) {
  const startOff = timeToOffset(ghost.predictedTime)
  const endOff = timeToOffset(ghost.endTime)
  const leftPx = offsetToPixel(startOff, zoom)
  const widthPx = offsetToPixel(endOff - startOff, zoom)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="tl-ghost-block absolute top-1.5 bottom-1.5 cursor-pointer rounded-md border border-dashed border-zinc-600/50 bg-zinc-600/10 backdrop-blur-[2px] hover:border-zinc-500/60 hover:bg-zinc-600/15"
          style={{ left: leftPx, width: Math.max(widthPx, 40) }}
          aria-label={`Predicted available slot: ${ghost.label}`}
        >
          <div className="flex h-full flex-col items-center justify-center px-2 text-center">
            <span className="text-[10px] text-zinc-500">{ghost.label}</span>
            {ghost.conditional && (
              <span className="text-[9px] text-zinc-600">({ghost.conditional})</span>
            )}
            <span className="mt-0.5 text-[9px] text-zinc-600">(predicted)</span>
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="border-zinc-700 bg-zinc-900 text-foreground">
        <div className="text-xs">
          <p className="font-semibold">Predicted Available Slot</p>
          <p>{ghost.label}</p>
          {ghost.conditional && <p className="text-muted-foreground">{ghost.conditional}</p>}
          <p className="mt-1 text-emerald-400">Click to book this slot</p>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

// ── Merged Block Indicator ───────────────────────────────────────────────────

interface MergedBlockComponentProps {
  merged: MergedBlock
  zoom: ZoomLevel
}

export function MergedBlockComponent({ merged, zoom }: MergedBlockComponentProps) {
  const startOff = timeToOffset(merged.startTime)
  const endOff = timeToOffset(merged.endTime)
  const leftPx = offsetToPixel(startOff, zoom)
  const widthPx = offsetToPixel(endOff - startOff, zoom)

  return (
    <div
      className="absolute top-1 bottom-1 rounded-md border border-dashed border-zinc-700/30 bg-zinc-800/20"
      style={{ left: leftPx, width: widthPx }}
    >
      <div className="flex h-full items-center justify-center">
        <span className="text-[10px] text-zinc-600">
          MERGED WITH {merged.mergedWith}
        </span>
      </div>
    </div>
  )
}
