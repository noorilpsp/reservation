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

interface MessageKitchenDialogProps {
  wave: Wave | null
  tableNumber: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSend: (message: string) => void
}

const quickMessages = [
  "Hold 2 more min",
  "Rush please",
  "Guest complaint",
  "Check quality",
]

export function MessageKitchenDialog({
  wave,
  tableNumber,
  open,
  onOpenChange,
  onSend,
}: MessageKitchenDialogProps) {
  const [message, setMessage] = useState("")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">💬 MESSAGE KITCHEN</DialogTitle>
          <DialogDescription>
            About: {wave ? `${wave.icon} ${wave.label} Wave · ` : ""}Table {tableNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <p className="mb-2 text-sm font-medium">Quick messages:</p>
            <div className="flex flex-wrap gap-2">
              {quickMessages.map((quickMsg) => (
                <Button
                  key={quickMsg}
                  variant="outline"
                  size="sm"
                  onClick={() => setMessage(quickMsg)}
                >
                  {quickMsg}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="kitchen-message" className="mb-2 block text-sm font-medium">
              Or type:
            </label>
            <Textarea
              id="kitchen-message"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (message.trim()) {
                onSend(message)
                onOpenChange(false)
                setMessage("")
              }
            }}
            disabled={!message.trim()}
          >
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
