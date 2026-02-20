"use client"

import { useState } from "react"
import { CalendarDays, Clock, Users, Info, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  type TimeSlotStatus,
  timeSlots,
  getDurationForParty,
  formatDuration,
  getCapacityAtTime,
} from "@/lib/reservation-form-data"

interface FormBookingDetailsProps {
  date: string
  time: string
  partySize: number
  duration: number
  onDateChange: (date: string) => void
  onTimeChange: (time: string) => void
  onPartySizeChange: (size: number) => void
  onDurationChange: (duration: number) => void
}

function slotColor(status: TimeSlotStatus["status"]): string {
  switch (status) {
    case "available": return "text-emerald-400"
    case "busy": return "text-amber-400"
    case "full": return "text-red-400"
    case "closed": return "text-muted-foreground/40"
  }
}

function slotDot(status: TimeSlotStatus["status"]): string {
  switch (status) {
    case "available": return "bg-emerald-400"
    case "busy": return "bg-amber-400"
    case "full": return "bg-red-400"
    case "closed": return "bg-muted-foreground/40"
  }
}

export function FormBookingDetails({
  date,
  time,
  partySize,
  duration,
  onDateChange,
  onTimeChange,
  onPartySizeChange,
  onDurationChange,
}: FormBookingDetailsProps) {
  const [calOpen, setCalOpen] = useState(false)
  const autoDuration = getDurationForParty(partySize)
  const isCustomDuration = duration !== autoDuration
  const capacity = getCapacityAtTime(time)

  const dateObj = date ? new Date(date + "T12:00:00") : new Date()
  const dateLabel = dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  const partySizes = [1, 2, 3, 4, 5, 6]
  const [showLargeParty, setShowLargeParty] = useState(partySize > 6)

  return (
    <div className="space-y-5">
      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Date <span className="text-red-400">*</span>
          </label>
          <Popover open={calOpen} onOpenChange={setCalOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start bg-secondary/50 border-border/60 hover:bg-secondary/80 text-left font-normal"
              >
                <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                {dateLabel}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateObj}
                onSelect={(d) => {
                  if (d) {
                    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
                    onDateChange(iso)
                  }
                  setCalOpen(false)
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Time <span className="text-red-400">*</span>
          </label>
          <Select value={time} onValueChange={onTimeChange}>
            <SelectTrigger className="bg-secondary/50 border-border/60">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {timeSlots.map((slot) => (
                <SelectItem
                  key={slot.time}
                  value={slot.time}
                  disabled={slot.status === "closed"}
                  className={slotColor(slot.status)}
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${slotDot(slot.status)}`} />
                    {slot.label}
                    {slot.status === "full" && <span className="text-[10px] text-red-400 ml-1">(full)</span>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {capacity && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    capacity.occupancyPct >= 90
                      ? "bg-red-500"
                      : capacity.occupancyPct >= 70
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${capacity.occupancyPct}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {capacity.occupancyPct}% at {capacity.label}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Party Size */}
      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
          Party Size <span className="text-red-400">*</span>
        </label>
        {!showLargeParty ? (
          <div className="flex gap-1">
            {partySizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  onPartySizeChange(s)
                  onDurationChange(getDurationForParty(s))
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  partySize === s
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
                aria-pressed={partySize === s}
              >
                {s}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setShowLargeParty(true)
                onPartySizeChange(7)
                onDurationChange(getDurationForParty(7))
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                partySize > 6
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              7+
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const next = Math.max(7, partySize - 1)
                onPartySizeChange(next)
                onDurationChange(getDurationForParty(next))
              }}
              className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Decrease party size"
            >
              <Minus className="h-4 w-4" />
            </button>
            <div className="flex items-center justify-center w-16 py-2 rounded-lg bg-primary/10 border border-primary/30 text-lg font-semibold text-primary">
              {partySize}
            </div>
            <button
              type="button"
              onClick={() => {
                const next = partySize + 1
                onPartySizeChange(next)
                onDurationChange(getDurationForParty(next))
              }}
              className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Increase party size"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLargeParty(false)
                onPartySizeChange(4)
                onDurationChange(getDurationForParty(4))
              }}
              className="text-xs text-muted-foreground hover:text-foreground ml-2 underline underline-offset-2"
            >
              Back to 1-6
            </button>
          </div>
        )}
      </div>

      {/* Duration */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Duration
            {!isCustomDuration && <span className="ml-1.5 text-muted-foreground/60">(auto)</span>}
          </label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs">
                <p>Based on party of {partySize}: {formatDuration(autoDuration)}</p>
                <p className="text-muted-foreground mt-1">1-2 guests: 1h 15min, 3-4: 1h 30min, 5-6: 1h 45min, 7+: 2h</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select
          value={duration.toString()}
          onValueChange={(v) => onDurationChange(parseInt(v))}
        >
          <SelectTrigger className="bg-secondary/50 border-border/60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[60, 75, 90, 105, 120, 135, 150, 180].map((m) => (
              <SelectItem key={m} value={m.toString()}>
                {formatDuration(m)}
                {m === autoDuration && <span className="text-muted-foreground ml-1">(recommended)</span>}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
