"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Wave } from "@/lib/fire-control-data"

interface RushWaveDialogProps {
  wave: Wave | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => void
}

const quickReasons = [
  "Guest waiting long",
  "Guest complaint",
  "VIP table",
  "Other",
]

export function RushWaveDialog({ wave, open, onOpenChange, onConfirm }: RushWaveDialogProps) {
  const [reason, setReason] = useState("")

  if (!wave) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            🚀 RUSH {wave.label.toUpperCase()} WAVE?
          </DialogTitle>
          <DialogDescription>
            This will notify kitchen to prioritize this wave.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label htmlFor="rush-reason" className="mb-2 block text-sm font-medium">
              Reason (optional):
            </label>
            <Textarea
              id="rush-reason"
              placeholder="Guest is in a hurry"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Quick reasons:</p>
            <div className="flex flex-wrap gap-2">
              {quickReasons.map((quickReason) => (
                <Button
                  key={quickReason}
                  variant="outline"
                  size="sm"
                  onClick={() => setReason(quickReason)}
                >
                  {quickReason}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm(reason)
              onOpenChange(false)
              setReason("")
            }}
            className="gap-1.5"
          >
            🚀 Rush Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
