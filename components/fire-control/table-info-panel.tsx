"use client"

import { useState, useEffect } from "react"
import { Users, Clock, Wine } from "lucide-react"
import type { FireControlData } from "@/lib/fire-control-data"
import { formatCurrency, minutesAgo } from "@/lib/fire-control-data"

interface TableInfoPanelProps {
  data: FireControlData
}

export function TableInfoPanel({ data }: TableInfoPanelProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const elapsed = mounted ? minutesAgo(data.table.seatedAt) : 0

  return (
    <div className="space-y-6 rounded-xl border bg-card p-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold uppercase tracking-wide">
          TABLE {data.table.number} SUMMARY
        </h2>
      </div>

      <div className="border-t" />

      {/* Quick Stats */}
      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{data.table.guestCount} guests</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>Seated {elapsed} min ago</span>
        </div>
        <div className="flex items-center gap-2">
          <Wine className="h-4 w-4 text-muted-foreground" />
          <span className="capitalize">{data.table.pacing} pacing</span>
        </div>
      </div>

      <div className="border-t" />

      {/* Seats */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide">Seats</h3>
        <div className="space-y-2 text-sm">
          {data.seats.map((seat) => (
            <div key={seat.number}>
              <span className="font-medium">{seat.number}:</span>{" "}
              <span className="text-muted-foreground">{seat.summary}</span>
              {seat.dietary.length > 0 && (
                <span className="ml-1">
                  {seat.dietary.map((d) => (
                    <span key={d} className="text-base">
                      {d === "nut_allergy" ? " 🥜" : ""}
                    </span>
                  ))}
                </span>
              )}
              {seat.notes && seat.notes.length > 0 && (
                <span className="ml-1 text-base">{seat.notes[0]}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t" />

      {/* Bill */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide">Bill</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(data.table.bill.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span>{formatCurrency(data.table.bill.tax)}</span>
          </div>
          <div className="border-t pt-2" />
          <div className="flex items-center justify-between font-bold">
            <span>Total</span>
            <span>{formatCurrency(data.table.bill.total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {data.notes.length > 0 && (
        <>
          <div className="border-t" />
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide">Notes</h3>
            <div className="space-y-2 text-sm">
              {data.notes.map((note, idx) => (
                <div key={idx}>
                  <span className="mr-1.5">{note.icon}</span>
                  <span>{note.text}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
