'use client';

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatCurrency, dietaryIcons } from "@/lib/take-order-data"
import type { Seat } from "@/lib/take-order-data"

interface SeatSelectorProps {
  seats: Seat[]
  selectedSeatNumber: number
  onSelectSeat: (seatNumber: number) => void
  onAddGuest: () => void
}

export function SeatSelector({
  seats,
  selectedSeatNumber,
  onSelectSeat,
  onAddGuest,
}: SeatSelectorProps) {
  return (
    <div className="border-b border-border bg-card px-4 py-3">
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {seats.map((seat) => {
          const isSelected = seat.number === selectedSeatNumber
          const isEmpty = seat.items === 0

          return (
            <button
              key={seat.number}
              type="button"
              onClick={() => onSelectSeat(seat.number)}
              className={cn(
                "flex min-w-[110px] flex-col gap-1.5 rounded-lg border-2 p-3 text-left transition-all",
                isSelected
                  ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                  : isEmpty
                    ? "border-dashed border-border bg-muted/30 hover:border-muted-foreground/40"
                    : "border-border bg-background hover:border-primary/50"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Seat {seat.number}</span>
                {seat.dietary.length > 0 && (
                  <div className="flex gap-0.5">
                    {seat.dietary.map((d) => (
                      <span key={d} className="text-base leading-none">
                        {dietaryIcons[d]?.icon}
                      </span>
                    ))}
                  </div>
                )}
                {seat.notes && seat.notes.length > 0 && (
                  <span className="text-base leading-none">{seat.notes[0]}</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {seat.items} {seat.items === 1 ? "item" : "items"}
              </div>
              <div className="text-sm font-semibold">
                {seat.total > 0 ? formatCurrency(seat.total) : "—"}
              </div>
            </button>
          )
        })}

        <Button
          variant="outline"
          className="min-w-[110px] shrink-0 border-dashed bg-transparent"
          onClick={onAddGuest}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Guest
        </Button>
      </div>
    </div>
  )
}
