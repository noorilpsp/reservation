'use client';

import { CheckCircle, FileText, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/take-order-data"

interface TakeOrderActionBarProps {
  itemCount: number
  total: number
  onTableNote: () => void
  onClearAll: () => void
  onSendToKitchen: () => void
}

export function TakeOrderActionBar({
  itemCount,
  total,
  onTableNote,
  onClearAll,
  onSendToKitchen,
}: TakeOrderActionBarProps) {
  const hasItems = itemCount > 0

  return (
    <div className="flex items-center justify-between gap-3 border-t border-border bg-card px-4 py-3">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onTableNote} className="gap-2 bg-transparent">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Table Note</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearAll}
          disabled={!hasItems}
          className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive bg-transparent"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Clear All</span>
        </Button>
      </div>

      <Button
        onClick={onSendToKitchen}
        disabled={!hasItems}
        size="lg"
        className="gap-2"
      >
        <CheckCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Send to Kitchen</span>
        <span className="sm:hidden">Send</span>
        <span className="hidden font-semibold sm:inline">— {formatCurrency(total)}</span>
      </Button>
    </div>
  )
}
