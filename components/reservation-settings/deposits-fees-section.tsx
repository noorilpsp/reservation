"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Edit, Plus, Trash2 } from "lucide-react"
import type { DepositSettings } from "@/lib/reservation-settings-data"

interface Props {
  deposits: DepositSettings
  onChange: (d: DepositSettings) => void
}

export function DepositsFeesSection({ deposits, onChange }: Props) {
  function updateRule(idx: number, updates: Partial<(typeof deposits.rules)[0]>) {
    const rules = deposits.rules.map((r, i) => (i === idx ? { ...r, ...updates } : r))
    onChange({ ...deposits, rules })
  }

  function toggleExperience(idx: number) {
    const exps = deposits.prepaidExperiences.map((e, i) => (i === idx ? { ...e, active: !e.active } : e))
    onChange({ ...deposits, prepaidExperiences: exps })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Deposits & Prepayment</h3>
        <p className="text-xs text-muted-foreground">Require financial commitment for certain reservations.</p>
      </div>

      {/* Deposit Rules */}
      <Card className="border-border/30 bg-secondary/30 p-4 backdrop-blur-sm">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deposit Rules</h4>
        <p className="mb-3 text-[11px] text-muted-foreground/70">When to require a deposit:</p>
        <div className="flex flex-col gap-3">
          {deposits.rules.map((rule, idx) => (
            <div key={rule.condition} className="flex items-center gap-3">
              <Checkbox
                checked={rule.enabled}
                onCheckedChange={(c) => updateRule(idx, { enabled: !!c })}
              />
              <span className="min-w-0 flex-1 text-xs text-muted-foreground">{rule.label}</span>
              <div className="flex shrink-0 items-center gap-1.5">
                <span className="text-xs text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={rule.amount}
                  onChange={(e) => updateRule(idx, { amount: Number(e.target.value) })}
                  className="h-7 w-16 border-border/30 bg-secondary/50 text-center text-xs"
                  min={0}
                  disabled={!rule.enabled}
                />
                <span className="text-[10px] text-muted-foreground/60">/ person</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-border/20 pt-3">
          <span className="text-[11px] text-muted-foreground/70">Credit card hold (no charge):</span>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={deposits.cardOnFile.online}
              onCheckedChange={(c) => onChange({ ...deposits, cardOnFile: { ...deposits.cardOnFile, online: !!c } })}
            />
            Require card on file for all online bookings
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={deposits.cardOnFile.phone}
              onCheckedChange={(c) => onChange({ ...deposits, cardOnFile: { ...deposits.cardOnFile, phone: !!c } })}
            />
            Require card for phone bookings
          </label>
        </div>
      </Card>

      {/* Deposit Handling */}
      <Card className="border-border/30 bg-secondary/30 p-4 backdrop-blur-sm">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deposit Handling</h4>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Label className="w-44 text-xs text-muted-foreground">Deposit applied to final check:</Label>
            <RadioGroup
              value={deposits.appliedToCheck ? "yes" : "no"}
              onValueChange={(v) => onChange({ ...deposits, appliedToCheck: v === "yes" })}
              className="flex gap-3"
            >
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="yes" id="atc-yes" />
                <Label htmlFor="atc-yes" className="text-xs text-muted-foreground">Yes</Label>
              </div>
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="no" id="atc-no" />
                <Label htmlFor="atc-no" className="text-xs text-muted-foreground">No (non-refund)</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="flex items-center gap-3">
            <Label className="w-44 text-xs text-muted-foreground">Refund on timely cancellation:</Label>
            <RadioGroup
              value={deposits.refundPolicy}
              onValueChange={(v) => onChange({ ...deposits, refundPolicy: v as "full" | "partial" | "none" })}
              className="flex gap-3"
            >
              {(["full", "partial", "none"] as const).map((p) => (
                <div key={p} className="flex items-center gap-1.5">
                  <RadioGroupItem value={p} id={`rp-${p}`} />
                  <Label htmlFor={`rp-${p}`} className="text-xs capitalize text-muted-foreground">{p === "none" ? "No" : p}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="flex items-center gap-3">
            <Label className="w-44 text-xs text-muted-foreground">Refund window:</Label>
            <Select value={String(deposits.refundWindow)} onValueChange={(v) => onChange({ ...deposits, refundWindow: Number(v) })}>
              <SelectTrigger className="h-7 w-32 border-border/30 bg-secondary/50 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[60, 120, 240, 480, 720, 1440].map((m) => (
                  <SelectItem key={m} value={String(m)}>{m < 60 ? `${m} min` : `${m / 60} hours`} before res</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Label className="w-44 text-xs text-muted-foreground">Payment processor:</Label>
            <Select value={deposits.processor} onValueChange={(v) => onChange({ ...deposits, processor: v })}>
              <SelectTrigger className="h-7 w-28 border-border/30 bg-secondary/50 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="square">Square</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Prepaid Experiences */}
      <Card className="border-border/30 bg-secondary/30 p-4 backdrop-blur-sm">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prepaid Experiences</h4>
          <Button size="sm" variant="outline" className="h-6 gap-1 border-border/50 text-[10px]">
            <Plus className="h-3 w-3" />
            Add Experience
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {deposits.prepaidExperiences.map((exp, idx) => (
            <div key={exp.name} className={`flex items-center justify-between rounded-lg bg-secondary/40 p-3 ${!exp.active ? "opacity-50" : ""}`}>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-foreground">{exp.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  ${exp.price}/{exp.perCouple ? "couple" : "person"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground"><Edit className="h-3 w-3" /></Button>
                <Switch checked={exp.active} onCheckedChange={() => toggleExperience(idx)} className="scale-75" aria-label={`Toggle ${exp.name}`} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
