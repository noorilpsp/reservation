"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Info, Lightbulb, Timer } from "lucide-react"
import type { TurnTimes } from "@/lib/reservation-settings-data"

interface Props {
  turnTimes: TurnTimes
  onChange: (turnTimes: TurnTimes) => void
}

const partySizeLabels: Record<string, string> = {
  "1": "1 guest",
  "2": "2 guests",
  "3-4": "3-4 guests",
  "5-6": "5-6 guests",
  "7-8": "7-8 guests",
  "9-10": "9-10 guests",
  "10+": "10+ guests",
}

const bufferOptions = [5, 10, 15, 20, 25, 30]
const mealPeriods = ["lunch", "dinner", "brunch"] as const

export function TurnTimesSection({ turnTimes, onChange }: Props) {
  function updatePartyTime(meal: string, size: string, value: number) {
    const updated = {
      ...turnTimes,
      byPartySize: {
        ...turnTimes.byPartySize,
        [meal]: { ...turnTimes.byPartySize[meal], [size]: value },
      },
    }
    onChange(updated)
  }

  function updateSmartAdjust(key: keyof TurnTimes["smartAdjust"], value: boolean) {
    onChange({
      ...turnTimes,
      smartAdjust: { ...turnTimes.smartAdjust, [key]: value },
    })
  }

  const partySizes = Object.keys(turnTimes.byPartySize.lunch)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Turn Time Defaults</h3>
        <p className="text-xs text-muted-foreground">Expected dining duration by party size. Used for capacity planning, ghost block predictions, and table availability.</p>
      </div>

      {/* Party size table */}
      <Card className="border-border/30 bg-secondary/30 p-0 backdrop-blur-sm">
        <div className="p-3 pb-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">By Party Size</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/20">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Party Size</th>
                {mealPeriods.map((m) => (
                  <th key={m} className="px-3 py-2 text-left font-medium capitalize text-muted-foreground">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {partySizes.map((size) => (
                <tr key={size} className="border-b border-border/10 last:border-0">
                  <td className="px-3 py-2 text-muted-foreground">{partySizeLabels[size]}</td>
                  {mealPeriods.map((meal) => (
                    <td key={meal} className="px-3 py-2">
                      <Input
                        type="number"
                        value={turnTimes.byPartySize[meal]?.[size] ?? 0}
                        onChange={(e) => updatePartyTime(meal, size, Number(e.target.value))}
                        className="h-7 w-20 border-border/30 bg-secondary/50 text-center text-xs"
                        min={15}
                        step={5}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Buffer Times */}
      <Card className="border-border/30 bg-secondary/30 p-4 backdrop-blur-sm">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Buffer Time Between Seatings</h4>
        <div className="flex flex-col gap-3">
          {([
            { key: "bufferDefault" as const, label: "Default buffer", hint: "Time between one party leaving and next being seated. Accounts for clearing, resetting, and cleaning." },
            { key: "bufferVIP" as const, label: "VIP buffer", hint: "Extra buffer for VIP reservations -- table prepped with special touches before arrival." },
            { key: "bufferLargeParty" as const, label: "Large party buffer", hint: "Merged tables take longer to reset. (6+ guests)" },
          ]).map(({ key, label, hint }) => (
            <div key={key} className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <Label className="w-36 text-xs text-muted-foreground">{label}:</Label>
                <Select
                  value={String(turnTimes[key])}
                  onValueChange={(v) => onChange({ ...turnTimes, [key]: Number(v) })}
                >
                  <SelectTrigger className="h-7 w-28 border-border/30 bg-secondary/50 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bufferOptions.map((b) => <SelectItem key={b} value={String(b)}>{b} min</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <p className="flex items-start gap-1 text-[10px] text-muted-foreground/70">
                <Info className="mt-0.5 h-2.5 w-2.5 shrink-0" />
                {hint}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Smart Adjustments */}
      <Card className="border-border/30 bg-secondary/30 p-4 backdrop-blur-sm">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Smart Adjustments</h4>
        <div className="flex flex-col gap-3">
          {([
            { key: "learnFromActual" as const, label: "Learn from actual turn times", desc: `System adjusts predictions based on historical data. Current accuracy: ${Math.round(turnTimes.currentAccuracy * 100)}% within +/-10 min` },
            { key: "adjustForDay" as const, label: "Adjust for day of week", desc: "Fri/Sat dinners typically +15 min vs weekdays." },
            { key: "adjustForOccasion" as const, label: "Adjust for special occasions", desc: "Birthday/anniversary tags add +15 min to estimate." },
            { key: "adjustForWeather" as const, label: "Adjust for weather", desc: "Patio turn times vary with conditions. (Requires weather integration -- not yet enabled)" },
          ]).map(({ key, label, desc }) => (
            <label key={key} className="flex items-start gap-2.5">
              <Checkbox
                checked={turnTimes.smartAdjust[key]}
                onCheckedChange={(checked) => updateSmartAdjust(key, !!checked)}
                disabled={key === "adjustForWeather"}
                className="mt-0.5"
              />
              <div className="flex flex-col gap-0.5">
                <span className={`text-xs ${key === "adjustForWeather" ? "text-muted-foreground/50" : "text-foreground"}`}>{label}</span>
                <span className="text-[10px] text-muted-foreground/70">{desc}</span>
              </div>
            </label>
          ))}
        </div>
      </Card>

      {/* Impact callout */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
        <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-amber-300">Impact</span>
          <span className="text-[11px] text-amber-200/80">
            Your current dinner turn time defaults allow approximately 2.0 turns per table during dinner service. Reducing 2-top dinner from 75 to 60 min could add ~4 more covers per night.
          </span>
        </div>
      </div>
    </div>
  )
}
