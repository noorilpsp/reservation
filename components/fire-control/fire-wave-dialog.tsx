"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Wave } from "@/lib/fire-control-data"

interface FireWaveDialogProps {
  wave: Wave | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function FireWaveDialog({ wave, open, onOpenChange, onConfirm }: FireWaveDialogProps) {
  if (!wave) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            🔥 FIRE {wave.label.toUpperCase()} WAVE?
          </DialogTitle>
          <DialogDescription>
            This will send {wave.itemsTotal} {wave.itemsTotal === 1 ? "item" : "items"} to the kitchen.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="rounded-lg border bg-muted/50 p-3">
            <ul className="space-y-1.5">
              {wave.items.map((item) => (
                <li key={item.id} className="text-sm">
                  • {item.name} (Seat {item.seat})
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border bg-card p-3">
            <p className="text-sm text-muted-foreground">
              Estimated ready time: <span className="font-semibold text-foreground">~8 min</span>
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
            className="bg-gradient-to-r from-orange-500 to-red-500 font-bold text-white hover:from-orange-600 hover:to-red-600"
          >
            🔥 Fire Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
