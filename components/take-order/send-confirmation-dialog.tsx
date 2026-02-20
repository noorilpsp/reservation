'use client';

import { useState } from "react"
import { CheckCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/take-order-data"
import type { OrderItem } from "@/lib/take-order-data"

interface SendConfirmationDialogProps {
  open: boolean
  tableNumber: number
  items: OrderItem[]
  total: number
  onClose: () => void
  onConfirm: (holdFood: boolean) => void
}

export function SendConfirmationDialog({
  open,
  tableNumber,
  items,
  total,
  onClose,
  onConfirm,
}: SendConfirmationDialogProps) {
  const [holdFood, setHoldFood] = useState(false)

  const drinkItems = items.filter((i) => i.wave === "drinks")
  const foodItems = items.filter((i) => i.wave === "food")

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CheckCircle className="h-6 w-6 text-success" />
            SEND ORDER?
          </DialogTitle>
          <DialogDescription>
            Table {tableNumber} · {items.length} {items.length === 1 ? "item" : "items"} ·{" "}
            {formatCurrency(total)}
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="space-y-3">
          {drinkItems.length > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🍹</span>
                <span className="font-medium">
                  Drinks ({drinkItems.length} {drinkItems.length === 1 ? "item" : "items"})
                </span>
              </div>
              <span className="text-sm text-muted-foreground">Fires immediately</span>
            </div>
          )}

          {foodItems.length > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🍽️</span>
                <span className="font-medium">
                  Food ({foodItems.length} {foodItems.length === 1 ? "item" : "items"})
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {holdFood ? "Hold for manual fire" : "Fires immediately"}
              </span>
            </div>
          )}
        </div>

        <Separator />

        {foodItems.length > 0 && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hold-food"
              checked={holdFood}
              onCheckedChange={(checked) => setHoldFood(checked === true)}
            />
            <Label htmlFor="hold-food" className="cursor-pointer text-sm font-normal">
              Hold food wave (fire manually later)
            </Label>
          </div>
        )}

        <Separator />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(holdFood)} size="lg">
            Send Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
