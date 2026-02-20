"use client"

import { useState, useCallback } from "react"
import { ReservationDetailPanel } from "@/components/reservations/reservation-detail-panel"
import {
  type DetailStatus,
  getReservationByStatus,
  statusConfig,
} from "@/lib/detail-modal-data"
import { cn } from "@/lib/utils"

const allStatuses: DetailStatus[] = [
  "confirmed",
  "arriving",
  "seated",
  "late",
  "completed",
  "no_show",
  "cancelled",
]

export default function ReservationDetailPage() {
  const [activeStatus, setActiveStatus] = useState<DetailStatus>("arriving")
  const [panelOpen, setPanelOpen] = useState(true)

  const reservation = getReservationByStatus(activeStatus)
  const handleClose = useCallback(() => setPanelOpen(false), [])

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Demo toolbar */}
      <div className="sticky top-0 z-30 border-b border-zinc-800/50 bg-zinc-950/95 px-4 py-3 backdrop-blur-xl">
        <h1 className="mb-3 text-sm font-semibold text-foreground">Reservation Detail Inspector</h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Status:</span>
          {allStatuses.map((status) => {
            const cfg = statusConfig[status]
            return (
              <button
                key={status}
                onClick={() => {
                  setActiveStatus(status)
                  setPanelOpen(true)
                }}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                  activeStatus === status
                    ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                    : "border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                )}
              >
                {cfg.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main area: just a prompt to open the panel */}
      <div className="flex flex-1 items-center justify-center p-8">
        {!panelOpen && (
          <button
            onClick={() => setPanelOpen(true)}
            className="rounded-xl border border-zinc-700 bg-zinc-900/50 px-6 py-4 text-sm text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
          >
            Click any status above or press here to open the detail panel
          </button>
        )}
      </div>

      {/* Detail panel */}
      <ReservationDetailPanel
        reservation={reservation}
        open={panelOpen}
        onClose={handleClose}
      />
    </div>
  )
}
