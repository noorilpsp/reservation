"use client"

import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Info } from "lucide-react"
import type { BookingWindow } from "@/lib/reservation-settings-data"

interface Props {
  bookingWindow: BookingWindow
  onChange: (bw: BookingWindow) => void
}

export function BookingWindowSection({ bookingWindow, onChange }: Props) {
  function update<K extends keyof BookingWindow>(key: K, val: BookingWindow[K]) {
    onChange({ ...bookingWindow, [key]: val })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Booking Window</h3>
        <p className="text-xs text-muted-foreground">Control how far in advance guests can book and last-minute booking rules.</p>
      </div>

      {/* Advance Booking */}
      <Card className="border-border/30 bg-secondary/30 p-4 backdrop-blur-sm">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Advance Booking</h4>
        <p className="mb-3 text-[11px] text-muted-foreground/70">How far in advance can guests book?</p>
        <div className="flex flex-col gap-3">
          {([
            { key: "advanceOnline" as const, label: "Online / Widget", suffix: "days" },
            { key: "advanceDirect" as const, label: "Phone / Direct", suffix: "days" },
            { key: "advanceVIP" as const, label: "VIP guests", suffix: "days" },
          ]).map(({ key, label, suffix }) => (
            <div key={key} className="flex items-center gap-3">
              <Label className="w-28 text-xs text-muted-foreground">{label}:</Label>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  value={bookingWindow[key]}
                  onChange={(e) => update(key, Number(e.target.value))}
                  className="h-7 w-20 border-border/30 bg-secondary/50 text-center text-xs"
                  min={1}
                />
                <span className="text-xs text-muted-foreground">{suffix}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 flex items-start gap-1 text-[10px] text-muted-foreground/70">
          <Info className="mt-0.5 h-2.5 w-2.5 shrink-0" />
          Online slots open {bookingWindow.advanceOnline} days before date. Staff can book up to {bookingWindow.advanceDirect} days via phone/direct. VIP guests get earliest access at {bookingWindow.advanceVIP} days.
        </p>
      </Card>

      {/* Minimum Notice */}
      <Card className="border-border/30 bg-secondary/30 p-4 backdrop-blur-sm">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Minimum Notice</h4>
        <p className="mb-3 text-[11px] text-muted-foreground/70">Minimum time before a reservation:</p>
        <div className="flex flex-col gap-3">
          {([
            { key: "minNoticeOnline" as const, label: "Online / Widget" },
            { key: "minNoticeDirect" as const, label: "Phone / Direct" },
          ]).map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3">
              <Label className="w-28 text-xs text-muted-foreground">{label}:</Label>
              <Select value={String(bookingWindow[key])} onValueChange={(v) => update(key, Number(v))}>
                <SelectTrigger className="h-7 w-32 border-border/30 bg-secondary/50 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[15, 30, 60, 120, 240, 480].map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {m < 60 ? `${m} minutes` : `${m / 60} hour${m / 60 > 1 ? "s" : ""}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </Card>

      {/* Cancellation Policy */}
      <Card className="border-border/30 bg-secondary/30 p-4 backdrop-blur-sm">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cancellation Policy</h4>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Label className="w-40 text-xs text-muted-foreground">Free cancellation window:</Label>
            <Select value={String(bookingWindow.cancellationWindow)} onValueChange={(v) => update("cancellationWindow", Number(v))}>
              <SelectTrigger className="h-7 w-32 border-border/30 bg-secondary/50 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[60, 120, 240, 480, 720, 1440].map((m) => (
                  <SelectItem key={m} value={String(m)}>
                    {m < 60 ? `${m} min` : `${m / 60} hour${m / 60 > 1 ? "s" : ""}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Label className="w-40 text-xs text-muted-foreground">Late cancellation fee:</Label>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">$</span>
              <Input
                type="number"
                value={bookingWindow.lateCancelFee}
                onChange={(e) => update("lateCancelFee", Number(e.target.value))}
                className="h-7 w-20 border-border/30 bg-secondary/50 text-center text-xs"
                min={0}
              />
              <span className="text-xs text-muted-foreground">per person</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Label className="w-40 text-xs text-muted-foreground">No-show fee:</Label>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">$</span>
              <Input
                type="number"
                value={bookingWindow.noShowFee}
                onChange={(e) => update("noShowFee", Number(e.target.value))}
                className="h-7 w-20 border-border/30 bg-secondary/50 text-center text-xs"
                min={0}
              />
              <span className="text-xs text-muted-foreground">per person</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            {([
              { key: "waiveFirstNoShow" as const, label: "Waive fees for first-time no-shows" },
              { key: "waiveVIPFees" as const, label: "Waive fees for VIP guests" },
              { key: "allowStaffOverride" as const, label: "Allow staff to override fees" },
            ]).map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Checkbox checked={bookingWindow[key]} onCheckedChange={(c) => update(key, !!c)} />
                {label}
              </label>
            ))}
          </div>

          <div className="flex flex-col gap-1.5 pt-1">
            <Label className="text-xs text-muted-foreground">Display policy text (shown to guests):</Label>
            <Textarea
              value={bookingWindow.cancellationPolicyText}
              onChange={(e) => update("cancellationPolicyText", e.target.value)}
              className="min-h-16 border-border/30 bg-secondary/50 text-xs"
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Modification Rules */}
      <Card className="border-border/30 bg-secondary/30 p-4 backdrop-blur-sm">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Modification Rules</h4>
        <div className="flex flex-col gap-2">
          {([
            { key: "allowGuestModifyTime" as const, label: "Allow guests to modify time (online)" },
            { key: "allowGuestModifySize" as const, label: "Allow guests to modify party size (online)" },
            { key: "allowGuestModifyTable" as const, label: "Allow guests to modify table preference (online)" },
          ]).map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-xs text-muted-foreground">
              <Checkbox checked={bookingWindow[key]} onCheckedChange={(c) => update(key, !!c)} />
              {label}
            </label>
          ))}
        </div>
      </Card>
    </div>
  )
}
