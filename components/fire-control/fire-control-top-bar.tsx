"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Users, Clock, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { FireControlData } from "@/lib/fire-control-data"
import { formatCurrency, minutesAgo } from "@/lib/fire-control-data"

interface FireControlTopBarProps {
  data: FireControlData
  onMessageKitchen: () => void
}

export function FireControlTopBar({ data, onMessageKitchen }: FireControlTopBarProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const elapsed = mounted ? minutesAgo(data.table.seatedAt) : 0

  return (
    <div className="flex items-center justify-between gap-3 border-b bg-card px-4 py-3">
      {/* Left: Back + Table Info */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" asChild>
          <Link href={`/table/${data.table.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">Table {data.table.number}</h1>
      </div>

      {/* Center: Stats (hidden on mobile) */}
      <div className="hidden items-center gap-4 text-sm text-muted-foreground md:flex">
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          <span>{data.table.guestCount} guests</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>{elapsed}m</span>
        </div>
        <div className="font-medium text-foreground">{formatCurrency(data.table.bill.total)}</div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onMessageKitchen} className="gap-1.5 bg-transparent">
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">Kitchen</span>
        </Button>
        <Button variant="default" size="sm" asChild>
          <Link href={`/table/${data.table.id}`}>Done</Link>
        </Button>
      </div>
    </div>
  )
}
