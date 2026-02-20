"use client"

import { Trophy, Check, MapPin } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  type TableAssignMode,
  type AvailableTable,
  getFilteredTables,
} from "@/lib/reservation-form-data"

interface FormTableAssignmentProps {
  mode: TableAssignMode
  assignedTable: string | null
  zonePreference: string
  partySize: number
  bestTable: AvailableTable | undefined
  onModeChange: (mode: TableAssignMode) => void
  onTableChange: (tableId: string | null) => void
  onZoneChange: (zone: string) => void
}

export function FormTableAssignment({
  mode,
  assignedTable,
  zonePreference,
  partySize,
  bestTable,
  onModeChange,
  onTableChange,
  onZoneChange,
}: FormTableAssignmentProps) {
  const tables = getFilteredTables(zonePreference, partySize)

  return (
    <div className="space-y-4">
      <RadioGroup
        value={mode}
        onValueChange={(v) => {
          onModeChange(v as TableAssignMode)
          if (v === "auto" && bestTable) {
            onTableChange(bestTable.id)
          } else if (v === "unassigned") {
            onTableChange(null)
          }
        }}
        className="space-y-2"
      >
        {/* Auto-assign */}
        <label
          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
            mode === "auto"
              ? "border-primary/40 bg-primary/5"
              : "border-border/40 bg-secondary/30 hover:border-border/60"
          }`}
        >
          <RadioGroupItem value="auto" id="auto" className="mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Label htmlFor="auto" className="text-sm font-medium cursor-pointer">
                Auto-assign
              </Label>
              {bestTable && (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-400/10 rounded-full px-2 py-0.5">
                  <Trophy className="h-2.5 w-2.5" />
                  Best: {bestTable.label}
                </span>
              )}
            </div>
            {bestTable && mode === "auto" && (
              <div className="mt-2 space-y-1">
                {bestTable.matchReasons.map((reason, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                    {reason}
                  </div>
                ))}
              </div>
            )}
          </div>
        </label>

        {/* Manual */}
        <label
          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
            mode === "manual"
              ? "border-primary/40 bg-primary/5"
              : "border-border/40 bg-secondary/30 hover:border-border/60"
          }`}
        >
          <RadioGroupItem value="manual" id="manual" className="mt-0.5" />
          <div className="flex-1 min-w-0">
            <Label htmlFor="manual" className="text-sm font-medium cursor-pointer">
              Choose manually
            </Label>
            {mode === "manual" && (
              <div className="mt-2">
                <Select
                  value={assignedTable ?? ""}
                  onValueChange={(v) => onTableChange(v || null)}
                >
                  <SelectTrigger className="bg-secondary/50 border-border/60">
                    <SelectValue placeholder="Select a table..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{t.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {t.seats}-top &middot; {t.zoneLabel}
                          </span>
                          {t.features.length > 0 && (
                            <span className="text-[10px] text-cyan-400">
                              {t.features.join(", ")}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            {t.availableFrom} - {t.availableUntil}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </label>

        {/* Unassigned */}
        <label
          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
            mode === "unassigned"
              ? "border-primary/40 bg-primary/5"
              : "border-border/40 bg-secondary/30 hover:border-border/60"
          }`}
        >
          <RadioGroupItem value="unassigned" id="unassigned" className="mt-0.5" />
          <div className="flex-1 min-w-0">
            <Label htmlFor="unassigned" className="text-sm font-medium cursor-pointer">
              Leave unassigned
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">Table will be assigned closer to arrival</p>
          </div>
        </label>
      </RadioGroup>

      {/* Zone preference */}
      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <MapPin className="h-3 w-3" />
          Zone preference
        </label>
        <Select value={zonePreference} onValueChange={onZoneChange}>
          <SelectTrigger className="bg-secondary/50 border-border/60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">No Preference</SelectItem>
            <SelectItem value="main">Main Dining</SelectItem>
            <SelectItem value="patio">Patio</SelectItem>
            <SelectItem value="private">Private Room</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
