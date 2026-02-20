"use client"

import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle } from "lucide-react"
import type { GuestPolicies } from "@/lib/reservation-settings-data"

interface Props {
  guestPolicies: GuestPolicies
  onChange: (gp: GuestPolicies) => void
}

export function GuestPoliciesSection({ guestPolicies, onChange }: Props) {
  const { dressCode, children, specialRequests, noShowManagement } = guestPolicies

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Guest Policies</h3>
        <p className="text-xs text-muted-foreground">Rules that affect guest experience and expectations.</p>
      </div>

      {/* Dress Code */}
      <Card className="border-border/30 bg-secondary/30 p-4 backdrop-blur-sm">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dress Code</h4>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Label className="w-24 text-xs text-muted-foreground">Dress code:</Label>
            <Select value={dressCode.code} onValueChange={(v) => onChange({ ...guestPolicies, dressCode: { ...dressCode, code: v } })}>
              <SelectTrigger className="h-7 w-36 border-border/30 bg-secondary/50 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["none", "casual", "smart_casual", "business_casual", "formal", "black_tie"].map((c) => (
                  <SelectItem key={c} value={c}>{c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Display message:</Label>
            <Textarea
              value={dressCode.message}
              onChange={(e) => onChange({ ...guestPolicies, dressCode: { ...dressCode, message: e.target.value } })}
              className="min-h-14 border-border/30 bg-secondary/50 text-xs"
              rows={2}
            />
          </div>
        </div>
      </Card>

      {/* Children Policy */}
      <Card className="border-border/30 bg-secondary/30 p-4 backdrop-blur-sm">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Children Policy</h4>
        <RadioGroup
          value={children.policy}
          onValueChange={(v) => onChange({ ...guestPolicies, children: { ...children, policy: v as typeof children.policy } })}
          className="flex flex-col gap-2"
        >
          {[
            { value: "welcome_all", label: "Welcome all hours" },
            { value: "before_8pm", label: "Welcome before 8 PM only" },
            { value: "not_recommended", label: "Not recommended (no kids menu)" },
          ].map(({ value, label }) => (
            <div key={value} className="flex items-center gap-2">
              <RadioGroupItem value={value} id={`child-${value}`} />
              <Label htmlFor={`child-${value}`} className="text-xs text-muted-foreground">{label}</Label>
            </div>
          ))}
        </RadioGroup>
        <div className="mt-3 flex flex-col gap-2">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={children.countInPartySize}
              onCheckedChange={(c) => onChange({ ...guestPolicies, children: { ...children, countInPartySize: !!c } })}
            />
            Count children in party size
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={children.offerHighChair}
              onCheckedChange={(c) => onChange({ ...guestPolicies, children: { ...children, offerHighChair: !!c } })}
            />
            Offer high chair option in booking widget
          </label>
        </div>
      </Card>

      {/* Special Requests */}
      <Card className="border-border/30 bg-secondary/30 p-4 backdrop-blur-sm">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Special Requests</h4>
        <div className="flex flex-col gap-2">
          {([
            { key: "enabled" as const, label: "Allow special requests in booking widget" },
            { key: "showAllergy" as const, label: "Show allergy/dietary fields" },
            { key: "showOccasion" as const, label: "Show occasion selector (birthday, anniversary, etc.)" },
            { key: "showSeating" as const, label: "Show seating preference (indoor, outdoor, bar, etc.)" },
            { key: "showTableRequest" as const, label: "Show specific table request" },
          ]).map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-xs text-muted-foreground">
              <Checkbox
                checked={specialRequests[key]}
                onCheckedChange={(c) => onChange({ ...guestPolicies, specialRequests: { ...specialRequests, [key]: !!c } })}
              />
              {label}
            </label>
          ))}
          <div className="mt-1 flex items-center gap-3">
            <Label className="text-xs text-muted-foreground">Max request length:</Label>
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                value={specialRequests.maxLength}
                onChange={(e) => onChange({ ...guestPolicies, specialRequests: { ...specialRequests, maxLength: Number(e.target.value) } })}
                className="h-7 w-20 border-border/30 bg-secondary/50 text-center text-xs"
                min={50}
                max={500}
              />
              <span className="text-[10px] text-muted-foreground">characters</span>
            </div>
          </div>
        </div>
      </Card>

      {/* No-Show Management */}
      <Card className="border-border/30 bg-secondary/30 p-4 backdrop-blur-sm">
        <div className="mb-3 flex items-start gap-2 rounded-md bg-amber-500/10 p-2" role="alert">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
          <span className="text-[11px] text-amber-200/80">Advanced -- affects guest relationships</span>
        </div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">No-Show Management</h4>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Label className="w-36 text-xs text-muted-foreground">Auto-flag after:</Label>
            <Select value={String(noShowManagement.flagAfter)} onValueChange={(v) => onChange({ ...guestPolicies, noShowManagement: { ...noShowManagement, flagAfter: Number(v) } })}>
              <SelectTrigger className="h-7 w-28 border-border/30 bg-secondary/50 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 5].map((n) => <SelectItem key={n} value={String(n)}>{n} no-show{n > 1 ? "s" : ""}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Label className="w-36 text-xs text-muted-foreground">Require deposit after:</Label>
            <Select value={String(noShowManagement.depositAfter)} onValueChange={(v) => onChange({ ...guestPolicies, noShowManagement: { ...noShowManagement, depositAfter: Number(v) } })}>
              <SelectTrigger className="h-7 w-28 border-border/30 bg-secondary/50 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1, 2, 3].map((n) => <SelectItem key={n} value={String(n)}>{n} no-show{n > 1 ? "s" : ""}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Label className="w-36 text-xs text-muted-foreground">Auto-block after:</Label>
            <Select value={noShowManagement.blockAfter === null ? "disabled" : String(noShowManagement.blockAfter)} onValueChange={(v) => onChange({ ...guestPolicies, noShowManagement: { ...noShowManagement, blockAfter: v === "disabled" ? null : Number(v) } })}>
              <SelectTrigger className="h-7 w-28 border-border/30 bg-secondary/50 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="disabled">Disabled</SelectItem>
                {[3, 5, 10].map((n) => <SelectItem key={n} value={String(n)}>{n} no-shows</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2 pt-1">
            {([
              { key: "sendFollowUp" as const, label: "Send no-show follow-up message (1 hour after)" },
              { key: "autoCharge" as const, label: "Auto-charge no-show fee (requires card on file)" },
              { key: "trackInProfile" as const, label: "Track no-show rate in guest profile" },
            ]).map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Checkbox
                  checked={noShowManagement[key]}
                  onCheckedChange={(c) => onChange({ ...guestPolicies, noShowManagement: { ...noShowManagement, [key]: !!c } })}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
