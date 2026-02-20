"use client"

import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { ConfirmationSettings } from "@/lib/reservation-settings-data"

interface Props {
  confirmations: ConfirmationSettings
  onChange: (c: ConfirmationSettings) => void
}

export function ConfirmationsSection({ confirmations, onChange }: Props) {
  const { autoConfirmRules, manualConfirmRules, latePolicy, dayOfReminder } = confirmations

  function updateAuto(key: keyof typeof autoConfirmRules, val: boolean) {
    onChange({ ...confirmations, autoConfirmRules: { ...autoConfirmRules, [key]: val } })
  }
  function updateManual(key: keyof typeof manualConfirmRules, val: boolean) {
    onChange({ ...confirmations, manualConfirmRules: { ...manualConfirmRules, [key]: val } })
  }
  function updateLate<K extends keyof typeof latePolicy>(key: K, val: (typeof latePolicy)[K]) {
    onChange({ ...confirmations, latePolicy: { ...latePolicy, [key]: val } })
  }
  function updateReminder<K extends keyof typeof dayOfReminder>(key: K, val: (typeof dayOfReminder)[K]) {
    onChange({ ...confirmations, dayOfReminder: { ...dayOfReminder, [key]: val } })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Confirmation Settings</h3>
        <p className="text-xs text-muted-foreground">How reservations are confirmed and when reminders are sent.</p>
      </div>

      {/* Auto-Confirmation */}
      <Card className="border-border/30 bg-secondary/30 p-4 backdrop-blur-sm">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Auto-Confirmation</h4>
        <p className="mb-2 text-[11px] text-muted-foreground/70">Auto-confirm reservations when:</p>
        <div className="flex flex-col gap-2">
          {([
            { key: "partyUnder5" as const, label: "Party size <= 4 guests" },
            { key: "knownGuest" as const, label: "Known guest (2+ previous visits)" },
            { key: "staffBooking" as const, label: "Direct/phone booking by staff" },
            { key: "allOnline" as const, label: "All online bookings" },
          ]).map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-xs text-muted-foreground">
              <Checkbox checked={autoConfirmRules[key]} onCheckedChange={(c) => updateAuto(key, !!c)} />
              {label}
            </label>
          ))}
        </div>

        <p className="mb-2 mt-4 text-[11px] text-muted-foreground/70">Require manual confirmation when:</p>
        <div className="flex flex-col gap-2">
          {([
            { key: "party5Plus" as const, label: "Party size 5+ guests" },
            { key: "firstTimerPeak" as const, label: "First-time guest + peak hours" },
            { key: "noShowHistory" as const, label: "Guest has no-show history" },
            { key: "specialRequests" as const, label: "Special requests attached" },
          ]).map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-xs text-muted-foreground">
              <Checkbox checked={manualConfirmRules[key]} onCheckedChange={(c) => updateManual(key, !!c)} />
              {label}
            </label>
          ))}
        </div>
      </Card>

      {/* Confirmation Request */}
      <Card className="border-border/30 bg-secondary/30 p-4 backdrop-blur-sm">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirmation Request</h4>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-muted-foreground/70">Send confirmation request via:</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Checkbox
                  checked={confirmations.confirmVia.sms}
                  onCheckedChange={(c) => onChange({ ...confirmations, confirmVia: { ...confirmations.confirmVia, sms: !!c } })}
                />
                SMS (primary)
              </label>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Checkbox
                  checked={confirmations.confirmVia.email}
                  onCheckedChange={(c) => onChange({ ...confirmations, confirmVia: { ...confirmations.confirmVia, email: !!c } })}
                />
                Email (secondary)
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Label className="w-32 text-xs text-muted-foreground">Send confirmation:</Label>
            <Select value={confirmations.sendConfirmation} onValueChange={(v) => onChange({ ...confirmations, sendConfirmation: v })}>
              <SelectTrigger className="h-7 w-48 border-border/30 bg-secondary/50 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="immediately">Immediately after booking</SelectItem>
                <SelectItem value="1_hour">1 hour after booking</SelectItem>
                <SelectItem value="next_morning">Next morning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Label className="w-32 text-xs text-muted-foreground">Wait for reply:</Label>
            <Select value={String(confirmations.waitForReply)} onValueChange={(v) => onChange({ ...confirmations, waitForReply: Number(v) })}>
              <SelectTrigger className="h-7 w-28 border-border/30 bg-secondary/50 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[6, 12, 24, 48].map((h) => <SelectItem key={h} value={String(h)}>{h} hours</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Label className="w-32 text-xs text-muted-foreground">If no reply:</Label>
            <Select value={confirmations.noReplyAction} onValueChange={(v) => onChange({ ...confirmations, noReplyAction: v })}>
              <SelectTrigger className="h-7 w-36 border-border/30 bg-secondary/50 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="send_followup">Send follow-up</SelectItem>
                <SelectItem value="cancel">Cancel reservation</SelectItem>
                <SelectItem value="mark_unconfirmed">Mark unconfirmed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Label className="w-32 text-xs text-muted-foreground">Final action:</Label>
            <Select value={confirmations.finalAction} onValueChange={(v) => onChange({ ...confirmations, finalAction: v })}>
              <SelectTrigger className="h-7 w-36 border-border/30 bg-secondary/50 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mark_unconfirmed">Mark as unconfirmed</SelectItem>
                <SelectItem value="auto_cancel">Auto cancel</SelectItem>
                <SelectItem value="keep">Keep reservation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Day-Of Reminders */}
      <Card className="border-border/30 bg-secondary/30 p-4 backdrop-blur-sm">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Day-Of Reminders</h4>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Label className="w-40 text-xs text-muted-foreground">Send day-of reminder:</Label>
            <Select value={String(dayOfReminder.timing)} onValueChange={(v) => updateReminder("timing", Number(v))}>
              <SelectTrigger className="h-7 w-32 border-border/30 bg-secondary/50 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[120, 180, 360, 720, 1440].map((m) => (
                  <SelectItem key={m} value={String(m)}>{m < 60 ? `${m} min` : `${m / 60} hours`} before</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Label className="w-40 text-xs text-muted-foreground">Send via:</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Checkbox checked={dayOfReminder.viaSms} onCheckedChange={(c) => updateReminder("viaSms", !!c)} />
                SMS
              </label>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Checkbox checked={dayOfReminder.viaEmail} onCheckedChange={(c) => updateReminder("viaEmail", !!c)} />
                Email
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Send for:</Label>
            <RadioGroup value={dayOfReminder.scope} onValueChange={(v) => updateReminder("scope", v)} className="flex flex-col gap-1.5">
              {[
                { value: "all", label: "All reservations" },
                { value: "unconfirmed", label: "Unconfirmed only" },
                { value: "large_party", label: "Large parties only (6+)" },
              ].map(({ value, label }) => (
                <div key={value} className="flex items-center gap-2">
                  <RadioGroupItem value={value} id={`scope-${value}`} />
                  <Label htmlFor={`scope-${value}`} className="text-xs text-muted-foreground">{label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </Card>

      {/* Late Guest Policy */}
      <Card className="border-border/30 bg-secondary/30 p-4 backdrop-blur-sm">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Late Guest Policy</h4>
        <div className="flex flex-col gap-3">
          {([
            { key: "gracePeriod" as const, label: 'Grace period before "late" status:', options: [5, 10, 15, 20] },
            { key: "autoTextAt" as const, label: '"Still coming?" text at:', options: [10, 15, 20, 30] },
            { key: "releaseAt" as const, label: "Release table after:", options: [15, 20, 30, 45, 60] },
          ]).map(({ key, label, options }) => (
            <div key={key} className="flex items-center gap-3">
              <Label className="w-48 text-xs text-muted-foreground">{label}</Label>
              <Select value={String(latePolicy[key])} onValueChange={(v) => updateLate(key, Number(v))}>
                <SelectTrigger className="h-7 w-28 border-border/30 bg-secondary/50 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {options.map((m) => <SelectItem key={m} value={String(m)}>{m} min{key !== "gracePeriod" ? " late" : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ))}
          <div className="flex flex-col gap-2 pt-1">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <Checkbox checked={latePolicy.extendForVIP} onCheckedChange={(c) => updateLate("extendForVIP", !!c)} />
              Extend grace period for VIP guests (+10 min)
            </label>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <Checkbox checked={latePolicy.staffOverride} onCheckedChange={(c) => updateLate("staffOverride", !!c)} />
              Allow staff to override auto-release
            </label>
          </div>
        </div>
      </Card>
    </div>
  )
}
