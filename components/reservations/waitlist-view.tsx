"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { useMediaQuery } from "@/hooks/use-media-query"
import { WaitlistTopBar } from "./waitlist-top-bar"
import { WaitlistAlertBanner } from "./waitlist-alert-banner"
import { WaitlistCard } from "./waitlist-card"
import { WaitlistMatchingPanel } from "./waitlist-matching-panel"
import { WaitlistQrPanel } from "./waitlist-qr-panel"
import { WaitlistCompleted } from "./waitlist-completed"
import { WaitlistAddDialog } from "./waitlist-add-dialog"
import { WaitlistSeatDialog } from "./waitlist-seat-dialog"
import { WaitlistDetailPanel } from "./waitlist-detail-panel"
import {
  type WaitlistEntry,
  type SortMode,
  activeWaitlist,
  sortWaitlist,
  getElapsedMinutes,
} from "@/lib/waitlist-data"

export function WaitlistView() {
  const isDesktop = useMediaQuery("(min-width: 1280px)")
  const isTablet = useMediaQuery("(min-width: 768px)")

  const [sortMode, setSortMode] = useState<SortMode>("smart")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [entries, setEntries] = useState<WaitlistEntry[]>(activeWaitlist)
  const [showAlert, setShowAlert] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [seatDialog, setSeatDialog] = useState<{ entry: WaitlistEntry; tableId: string } | null>(null)
  const [showMatchPanel, setShowMatchPanel] = useState(false)
  const [detailEntry, setDetailEntry] = useState<WaitlistEntry | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const sorted = useMemo(() => sortWaitlist(entries, sortMode), [entries, sortMode])

  useEffect(() => {
    if (!detailEntry) return
    const stillExists = entries.some((entry) => entry.id === detailEntry.id)
    if (!stillExists) {
      setDetailOpen(false)
      setDetailEntry(null)
    }
  }, [detailEntry, entries])

  // Alert match: first entry with ready-now match
  const alertEntry = entries.find((e) => e.bestMatch?.status === "ready-now")

  const handleSeatAt = useCallback(
    (entry: WaitlistEntry, tableId: string) => {
      if (!tableId) {
        // "Choose table" — open matching panel on tablet
        if (!isDesktop) setShowMatchPanel(true)
        return
      }
      setSeatDialog({ entry, tableId })
    },
    [isDesktop],
  )

  const handleConfirmSeat = useCallback(() => {
    if (!seatDialog) return
    setEntries((prev) => prev.filter((e) => e.id !== seatDialog.entry.id))
    setSeatDialog(null)
    setShowAlert(false)
  }, [seatDialog])

  const handleRemove = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const handleOpenDetail = useCallback((entry: WaitlistEntry) => {
    setDetailEntry(entry)
    setDetailOpen(true)
  }, [])

  const handleAdd = useCallback(
    (data: { name: string; phone: string; partySize: number; quote: number }) => {
      const newEntry: WaitlistEntry = {
        id: `wl-new-${Date.now()}`,
        name: data.name,
        partySize: data.partySize,
        quotedWait: data.quote,
        joinedAt: 143, // NOW
        location: "just-added",
        phone: data.phone,
        smsSent: true,
        smsStatus: "Just added",
        bestMatch: null,
        altMatches: [],
      }
      setEntries((prev) => [...prev, newEntry])
    },
    [],
  )

  const sortOptions: { value: SortMode; label: string }[] = [
    { value: "smart", label: "Smart" },
    { value: "wait-time", label: "Wait Time" },
    { value: "party-size", label: "Party Size" },
    { value: "quoted-time", label: "Quoted Time" },
  ]

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <WaitlistTopBar onAddParty={() => setShowAddDialog(true)} />

      {/* Alert Banner */}
      {showAlert && alertEntry && (
        <WaitlistAlertBanner
          tableId={alertEntry.bestMatch!.tableId}
          partyName={alertEntry.name}
          partySize={alertEntry.partySize}
          waitedMin={getElapsedMinutes(alertEntry)}
          quotedMin={alertEntry.quotedWait}
          onSeatNow={() => handleSeatAt(alertEntry, alertEntry.bestMatch!.tableId)}
          onDismiss={() => setShowAlert(false)}
        />
      )}

      {/* Main content */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left column: Waitlist Queue */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-none">
          {/* Sort header */}
          <div className="sticky top-0 z-10 flex items-center justify-between bg-zinc-950/90 px-4 py-3 backdrop-blur-sm lg:px-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Waitlist
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-600">Sort:</span>
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortMode(opt.value)}
                  className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                    sortMode === opt.value
                      ? "bg-zinc-800 text-zinc-200"
                      : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-400"
                  }`}
                  aria-label={`Sort by ${opt.label}`}
                >
                  {opt.label}
                </button>
              ))}
              {/* Tablet: show matching panel button */}
              {!isDesktop && isTablet && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowMatchPanel(true)}
                  className="ml-2 h-7 border-zinc-700 bg-zinc-800/60 px-2.5 text-[10px] text-zinc-400 hover:bg-zinc-700"
                >
                  Matching
                </Button>
              )}
            </div>
          </div>

          {/* Card list */}
          <div className="flex flex-col gap-3 px-4 pb-4 lg:px-6">
            {sorted.map((entry, i) => (
              <div
                key={entry.id}
                className="wl-card-stagger"
                style={{ "--card-index": i } as React.CSSProperties}
              >
                <WaitlistCard
                  entry={entry}
                  position={i + 1}
                  isExpanded={expandedId === entry.id}
                  onToggleExpand={() =>
                    setExpandedId((prev) => (prev === entry.id ? null : entry.id))
                  }
                  onOpenDetail={() => handleOpenDetail(entry)}
                  onSeatAt={(tableId) => handleSeatAt(entry, tableId)}
                  onTextGuest={() => {}}
                  onRemove={() => handleRemove(entry.id)}
                  onConvert={() => {}}
                />
              </div>
            ))}

            {/* Add button at bottom */}
            <button
              onClick={() => setShowAddDialog(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-800 py-4 text-sm text-zinc-500 transition-colors hover:border-zinc-700 hover:bg-zinc-800/30 hover:text-zinc-400"
            >
              <Plus className="h-4 w-4" />
              Add to Waitlist
            </button>

            {/* Completed / Removed */}
            <WaitlistCompleted />
          </div>
        </div>

        {/* Right column: Desktop matching panel */}
        {isDesktop && (
          <div className="w-[380px] flex-shrink-0 overflow-y-auto border-l border-zinc-800/50 p-4 scrollbar-none">
            <WaitlistMatchingPanel />
            <div className="mt-4">
              <WaitlistQrPanel />
            </div>
          </div>
        )}
      </div>

      {/* Mobile FAB */}
      {!isTablet && (
        <div className="fixed bottom-24 right-4 z-40">
          <Button
            size="lg"
            className="h-14 w-14 rounded-full bg-emerald-600 p-0 shadow-lg shadow-emerald-900/40 hover:bg-emerald-500"
            onClick={() => setShowAddDialog(true)}
            aria-label="Add to waitlist"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Tablet: Matching Panel Sheet */}
      {!isDesktop && (
        <Sheet open={showMatchPanel} onOpenChange={setShowMatchPanel}>
          <SheetContent
            side={isTablet ? "right" : "bottom"}
            className="w-full overflow-y-auto border-zinc-800 bg-zinc-900 p-4 sm:max-w-[420px]"
          >
            <SheetHeader className="mb-4">
              <SheetTitle className="text-zinc-100">Smart Matching</SheetTitle>
              <SheetDescription className="text-zinc-500">Table availability and forecasts</SheetDescription>
            </SheetHeader>
            <WaitlistMatchingPanel />
            <div className="mt-4">
              <WaitlistQrPanel />
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Add Dialog */}
      <WaitlistAddDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAdd}
      />

      {/* Seat Confirmation Dialog */}
      <WaitlistSeatDialog
        open={!!seatDialog}
        onOpenChange={(open) => { if (!open) setSeatDialog(null) }}
        entry={seatDialog?.entry ?? null}
        tableId={seatDialog?.tableId ?? ""}
        onConfirm={handleConfirmSeat}
      />

      <WaitlistDetailPanel
        entry={detailEntry}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onSeatAt={(tableId) => {
          if (!detailEntry) return
          handleSeatAt(detailEntry, tableId)
        }}
        onTextGuest={() => {}}
        onRemove={() => {
          if (!detailEntry) return
          handleRemove(detailEntry.id)
          setDetailOpen(false)
        }}
        onConvert={() => {}}
      />
    </div>
  )
}
