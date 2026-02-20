'use client';

import { CheckCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface OrderSuccessDialogProps {
  open: boolean
  itemCount: number
  onAddMore: () => void
  onBackToTable: () => void
}

export function OrderSuccessDialog({
  open,
  itemCount,
  onAddMore,
  onBackToTable,
}: OrderSuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <DialogTitle className="text-center text-2xl">ORDER SENT!</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              {itemCount} {itemCount === 1 ? "item" : "items"} sent to kitchen
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onAddMore} className="flex-1 bg-transparent">
            Add More Items
          </Button>
          <Button onClick={onBackToTable} className="flex-1">
            Back to Table
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
