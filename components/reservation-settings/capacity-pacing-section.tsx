"use client"

import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, Info } from "lucide-react"
import type { CapacitySettings } from "@/lib/reservation-settings-data"

interface Props {
  capacity: CapacitySettings
  onChange: (c: CapacitySettings) => void
}

export function CapacityPacingSection({ capacity, onChange }: Props) {
  function update<K extends keyof CapacitySettings>(key: K, val: CapacitySettings[K]) {
    onChange({ ...capacity, [key]: val })
  }

  function updatePacingSlot(idx: number, maxCovers: number) {
    const updated = capacity.pacing.dinner.map((s, i) => (i === idx ? { ...s, maxCovers } : s))
    onChange({ ...capacity, pacing: { dinner: updated } })
  }

  const dinnerMaxCovers = 78
  const holdBackCovers = Math.round((capacity.walkInHoldBack / 100) * dinnerMaxCovers)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Capacity & Pacing</h3>
        <p className="text-xs text-muted-foreground">Control how many reservations you accept and how they are distributed across the evening.</p>
      </div>

      {/* Overbooking Tolerance */}
      <Card className="border-border/30 bg-secondary/30 p-4 backdrop-blur-sm">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Overbooking Tolerance</h4>
        <div className="mb-3 flex items-start gap-2 rounded-md bg-amber-500/10 p-2" role="alert">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
          <span className="text-[11px] text-amber-200/80">
            Overbooking allows more reservations than capacity to compensate for expected no-shows and cancellations.
          </span>
        </div>
        <RadioGroup
          value={capacity.overbooking}
          onValueChange={(v) => update("overbooking", v as CapacitySettings["overbooking"])}
          className="flex flex-col gap-2"
        >
          {([
            { value: "disabled", label: "Disabled", desc: "0% -- never accept more than capacity" },
            { value: "conservative", label: "Conservative", desc: "5% -- accept up to 4 extra covers/period" },
            { value: "moderate", label: "Moderate", desc: "10% -- accept up to 8 extra covers/period" },
          ] as const).map(({ value, label, desc }) => (
            <div key={value} className="flex items-start gap-2">
              <RadioGroupItem value={value} id={`ob-${value}`} className="mt-0.5" />
              <div className="flex flex-col">
                <Label htmlFor={`ob-${value}`} className="text-xs text-foreground">{label}</Label>
                <span className="text-[10px] text-muted-foreground/70">{desc}</span>
              </div>
            </div>
          ))}
        </RadioGroup>
        <p className="mt-2 flex items-start gap-1 text-[10px] text-muted-foreground/70">
          <Info className="mt-0.5 h-2.5 w-2.5 shrink-0" />
          Your current no-show rate is {(capacity.noShowRate * 100).toFixed(1)}%. Conservative overbooking would be safe based on your data.
        </p>
      </Card>

      {/* Pacing */}
      <Card className="border-border/30 bg-secondary/30 p-4 backdrop-blur-sm">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pacing (Covers Per Slot)</h4>
        <p className="mb-3 text-[11px] text-muted-foreground/70">Maximum new covers per 15-min slot:</p>
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-medium text-muted-foreground">Dinner:</span>
          {capacity.pacing.dinner.map((slot, idx) => (
            <div key={slot.period} className="flex items-center gap-3">
              <span className="w-28 text-xs text-muted-foreground">{slot.period}</span>
              <Select value={String(slot.maxCovers)} onValueChange={(v) => updatePacingSlot(idx, Number(v))}>
                <SelectTrigger className="h-7 w-28 border-border/30 bg-secondary/50 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[4, 6, 8, 10, 12, 14, 16, 18, 20, 24].map((c) => <SelectItem key={c} value={String(c)}>{c} covers</SelectItem>)}
                </SelectContent>
              </Select>
              <span className="text-[10px] text-muted-foreground/60">({slot.label})</span>
            </div>
          ))}
        </div>
        <p className="mt-2 flex items-start gap-1 text-[10px] text-muted-foreground/70">
          <Info className="mt-0.5 h-2.5 w-2.5 shrink-0" />
          Pacing prevents kitchen overload by spreading arrivals across the service period.
        </p>
        <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Checkbox checked={capacity.autoAdjustPacing} onCheckedChange={(c) => update("autoAdjustPacing", !!c)} />
          Auto-adjust pacing based on kitchen load
        </label>
      </Card>

      {/* Walk-In Hold-Back */}
      <Card className="border-border/30 bg-secondary/30 p-4 backdrop-blur-sm">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Walk-In Hold-Back</h4>
        <p className="mb-2 text-[11px] text-muted-foreground/70">Reserve capacity for walk-ins:</p>
        <div className="flex items-center gap-3">
          <Label className="text-xs text-muted-foreground">Percentage held back:</Label>
          <Select value={String(capacity.walkInHoldBack)} onValueChange={(v) => update("walkInHoldBack", Number(v))}>
            <SelectTrigger className="h-7 w-20 border-border/30 bg-secondary/50 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[0, 5, 10, 15, 20, 25, 30].map((p) => <SelectItem key={p} value={String(p)}>{p}%</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground/60">= ~{holdBackCovers} covers held for walk-ins during dinner</p>

        <div className="mt-3 flex flex-col gap-2">
          <span className="text-[10px] text-muted-foreground">Hold-back schedule:</span>
          <RadioGroup value={String(capacity.releaseHeldTables)} onValueChange={(v) => update("releaseHeldTables", Number(v))} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="60" id="release-60" />
              <Label htmlFor="release-60" className="text-xs text-muted-foreground">Release held tables 1 hour before slot if unfilled</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="30" id="release-30" />
              <Label htmlFor="release-30" className="text-xs text-muted-foreground">Release held tables 30 min before slot</Label>
            </div>
          </RadioGroup>
        </div>
        <p className="mt-2 flex items-start gap-1 text-[10px] text-muted-foreground/70">
          <Info className="mt-0.5 h-2.5 w-2.5 shrink-0" />
          Walk-ins account for {Math.round(capacity.walkInHistorical * 100)}% of your covers historically. {capacity.walkInHoldBack}% hold-back is recommended.
        </p>
      </Card>

      {/* Party Size Limits */}
      <Card className="border-border/30 bg-secondary/30 p-4 backdrop-blur-sm">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Party Size Limits</h4>
        <p className="mb-2 text-[11px] text-muted-foreground/70">Online booking:</p>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Label className="w-36 text-xs text-muted-foreground">Minimum party size:</Label>
            <Select value={String(capacity.minPartyOnline)} onValueChange={(v) => update("minPartyOnline", Number(v))}>
              <SelectTrigger className="h-7 w-16 border-border/30 bg-secondary/50 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{[1, 2].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Label className="w-36 text-xs text-muted-foreground">Maximum party size:</Label>
            <Select value={String(capacity.maxPartyOnline)} onValueChange={(v) => update("maxPartyOnline", Number(v))}>
              <SelectTrigger className="h-7 w-16 border-border/30 bg-secondary/50 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{[4, 6, 8, 10, 12].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <p className="mt-2 flex items-start gap-1 text-[10px] text-muted-foreground/70">
          <Info className="mt-0.5 h-2.5 w-2.5 shrink-0" />
          Parties of {capacity.maxPartyOnline + 1}+ must call to book (requires table merge coordination).
        </p>
        <div className="mt-3 flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Large party notice (shown for 6+ online):</Label>
          <Textarea
            value={capacity.largePartyNotice}
            onChange={(e) => update("largePartyNotice", e.target.value)}
            className="min-h-14 border-border/30 bg-secondary/50 text-xs"
            rows={2}
          />
        </div>
      </Card>
    </div>
  )
}
