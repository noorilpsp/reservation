"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AlertTriangle, Globe, Lightbulb, Phone, Smartphone, UserCheck } from "lucide-react"
import type { ChannelSettings } from "@/lib/reservation-settings-data"

interface Props {
  channels: ChannelSettings
  onChange: (c: ChannelSettings) => void
}

const channelIcons: Record<string, React.ReactNode> = {
  online: <Globe className="h-3.5 w-3.5 text-blue-400" />,
  phone: <Phone className="h-3.5 w-3.5 text-green-400" />,
  google: <Smartphone className="h-3.5 w-3.5 text-red-400" />,
  walkIn: <UserCheck className="h-3.5 w-3.5 text-amber-400" />,
}
const channelLabels: Record<string, string> = {
  online: "Online Widget",
  phone: "Phone / Direct",
  google: "Google Reserve",
  walkIn: "Walk-in Hold",
}

const allocationOptions = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]

export function ChannelAllocationSection({ channels, onChange }: Props) {
  const allocatable = ["online", "phone", "google", "walkIn"] as const
  const total = allocatable.reduce((s, k) => {
    if (k === "walkIn") return s + channels.walkIn.allocation
    const ch = channels[k]
    return s + ("allocation" in ch ? ch.allocation : 0)
  }, 0)

  function updateAllocation(key: string, val: number) {
    if (key === "walkIn") {
      onChange({ ...channels, walkIn: { allocation: val } })
    } else {
      const ch = channels[key as keyof ChannelSettings]
      if (ch && typeof ch === "object" && "allocation" in ch) {
        onChange({ ...channels, [key]: { ...ch, allocation: val } })
      }
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Channel Allocation</h3>
        <p className="text-xs text-muted-foreground">Control what percentage of capacity is available on each booking channel.</p>
      </div>

      {/* Channel limits */}
      <Card className="border-border/30 bg-secondary/30 p-4 backdrop-blur-sm">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Channel Limits (% of available covers per period)</h4>
        <div className="flex flex-col gap-3">
          {allocatable.map((key) => {
            const alloc = key === "walkIn" ? channels.walkIn.allocation : (channels[key] as { allocation: number }).allocation
            return (
              <div key={key} className="flex items-center gap-3">
                <div className="flex w-36 items-center gap-2">
                  {channelIcons[key]}
                  <span className="text-xs text-foreground">{channelLabels[key]}</span>
                </div>
                <Select value={String(alloc)} onValueChange={(v) => updateAllocation(key, Number(v))}>
                  <SelectTrigger className="h-7 w-20 border-border/30 bg-secondary/50 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {allocationOptions.map((p) => <SelectItem key={p} value={String(p)}>{p}%</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="flex-1">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/80">
                    <div
                      className="h-full rounded-full bg-primary/60 transition-all"
                      style={{ width: `${(alloc / 50) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
          <div className="flex items-center gap-3 border-t border-border/20 pt-2">
            <span className="w-36 text-xs font-medium text-foreground">Total:</span>
            <Badge variant={total === 100 ? "default" : "destructive"} className={`text-xs ${total === 100 ? "bg-emerald-500/15 text-emerald-400" : ""}`}>
              {total}%
            </Badge>
            {total !== 100 && (
              <span className="flex items-center gap-1 text-[10px] text-destructive">
                <AlertTriangle className="h-3 w-3" />
                Total must equal 100%
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Per-Channel Settings */}
      <Card className="border-border/30 bg-secondary/30 p-4 backdrop-blur-sm">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Per-Channel Settings</h4>
        <div className="flex flex-col gap-4">
          {/* Online */}
          <div className="flex flex-col gap-1.5 rounded-lg bg-secondary/40 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-xs font-medium text-foreground">Online Widget</span>
              </div>
              <Switch
                checked={channels.online.enabled}
                onCheckedChange={(c) => onChange({ ...channels, online: { ...channels.online, enabled: c } })}
                className="scale-75"
                aria-label="Enable online widget"
              />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-muted-foreground/70">
              <span>Party sizes: {channels.online.partySizes}</span>
              <span>Advance: {channels.online.advanceDays} days</span>
              <span>Requires: {channels.online.requires?.join(", ")}</span>
            </div>
          </div>

          {/* Google */}
          <div className="flex flex-col gap-1.5 rounded-lg bg-secondary/40 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-3.5 w-3.5 text-red-400" />
                <span className="text-xs font-medium text-foreground">Google Reserve</span>
              </div>
              <Switch
                checked={channels.google.enabled}
                onCheckedChange={(c) => onChange({ ...channels, google: { ...channels.google, enabled: c } })}
                className="scale-75"
                aria-label="Enable Google Reserve"
              />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-muted-foreground/70">
              <span>Party sizes: {channels.google.partySizes}</span>
              <span>Auto-confirm: Yes (for parties {`<=${channels.google.autoConfirmMaxParty}`})</span>
            </div>
          </div>

          {/* Instagram */}
          <div className="flex flex-col gap-1.5 rounded-lg bg-secondary/40 p-3 opacity-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-3.5 w-3.5 text-pink-400" />
                <span className="text-xs font-medium text-foreground">Instagram DM</span>
              </div>
              <Badge variant="secondary" className="text-[9px]">Coming soon</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Insight */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
        <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-amber-300">Insight</span>
          <span className="text-[11px] text-amber-200/80">
            Last month, Google Reserve drove 15% of covers but had a 12% no-show rate (vs 3% for direct bookings). Consider requiring confirmation for Google bookings.
          </span>
        </div>
      </div>
    </div>
  )
}
