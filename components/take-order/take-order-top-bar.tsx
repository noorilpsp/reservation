'use client';

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency, dietaryIcons } from "@/lib/take-order-data"
import type { Seat } from "@/lib/take-order-data"

interface TakeOrderTopBarProps {
  tableNumber: number
  selectedSeat: Seat | undefined
  orderTotal: number
  onDone: () => void
}

export function TakeOrderTopBar({
  tableNumber,
  selectedSeat,
  orderTotal,
  onDone,
}: TakeOrderTopBarProps) {
  return (
    <div className="flex h-14 items-center justify-between gap-4 border-b border-border bg-card px-4">
      {/* Left: Back button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0"
        aria-label="Back to table"
        asChild
      >
        <Link href={`/table/t${tableNumber}`}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>

      {/* Center: Current seat info */}
      <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
        <span className="hidden text-sm text-muted-foreground sm:inline">
          Table {tableNumber}
        </span>
        {selectedSeat && (
          <>
            <span className="hidden text-sm text-muted-foreground sm:inline">·</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium">
                Ordering for: Seat {selectedSeat.number}
              </span>
              {selectedSeat.dietary.map((d) => (
                <span key={d} className="text-base leading-none">
                  {dietaryIcons[d]?.icon}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right: Total and Done */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden text-right sm:block">
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="text-sm font-semibold">{formatCurrency(orderTotal)}</div>
        </div>
        <Button size="sm" onClick={onDone} className="h-9">
          Done
        </Button>
      </div>
    </div>
  )
}
