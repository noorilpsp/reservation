"use client"

import Link from "next/link"
import { ArrowLeft, MessageSquare, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Wave } from "@/lib/fire-control-data"

interface FireControlActionBarProps {
  tableId: string
  heldWaves: Wave[]
  onFireAll: () => void
  onMessageKitchen: () => void
}

export function FireControlActionBar({
  tableId,
  heldWaves,
  onFireAll,
  onMessageKitchen,
}: FireControlActionBarProps) {
  const hasHeldWaves = heldWaves.length > 0

  return (
    <div className="flex items-center justify-between gap-3 border-t bg-card px-4 py-3">
      <Button variant="outline" asChild>
        <Link href={`/table/${tableId}`} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Table</span>
          <span className="sm:hidden">Back</span>
        </Link>
      </Button>

      <div className="flex items-center gap-2">
        {hasHeldWaves && (
          <Button
            onClick={onFireAll}
            className="gap-1.5 bg-gradient-to-r from-orange-500 to-red-500 font-bold text-white hover:from-orange-600 hover:to-red-600"
          >
            <Flame className="h-4 w-4" />
            <span className="hidden sm:inline">Fire All Held</span>
            <span className="sm:hidden">Fire All</span>
            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs">
              {heldWaves.length}
            </span>
          </Button>
        )}
        <Button variant="outline" onClick={onMessageKitchen} className="gap-1.5 bg-transparent">
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">Kitchen</span>
        </Button>
      </div>
    </div>
  )
}
