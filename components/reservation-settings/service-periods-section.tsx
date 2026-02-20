"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Clock, Edit, Moon, Plus, Sun, Sunrise, CloudSun, Trash2 } from "lucide-react"
import type { ServicePeriod } from "@/lib/reservation-settings-data"
import { formatTime, formatDays, allDays, dayLabels } from "@/lib/reservation-settings-data"

const iconMap: Record<string, React.ReactNode> = {
  sunrise: <Sunrise className="h-4 w-4 text-amber-400" />,
  "cloud-sun": <CloudSun className="h-4 w-4 text-amber-300" />,
  sun: <Sun className="h-4 w-4 text-yellow-400" />,
  moon: <Moon className="h-4 w-4 text-blue-300" />,
}

const timeSlots: string[] = []
for (let h = 0; h < 24; h++) {
  for (const m of [0, 15, 30, 45]) {
    const val = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
    timeSlots.push(val)
  }
}

interface Props {
  periods: ServicePeriod[]
  onChange: (periods: ServicePeriod[]) => void
}

export function ServicePeriodsSection({ periods, onChange }: Props) {
  const [editingPeriod, setEditingPeriod] = useState<ServicePeriod | null>(null)
  const [isNew, setIsNew] = useState(false)

  function handleEditOpen(period: ServicePeriod) {
    setEditingPeriod({ ...period })
    setIsNew(false)
  }

  function handleAddNew() {
    setEditingPeriod({
      id: `sp_${Date.now()}`,
      name: "",
      icon: "sun",
      startTime: "12:00",
      endTime: "15:00",
      lastSeating: "14:30",
      days: ["mon", "tue", "wed", "thu", "fri"],
      maxCovers: 40,
      slotInterval: 15,
      active: true,
    })
    setIsNew(true)
  }

  function handleSavePeriod() {
    if (!editingPeriod) return
    if (isNew) {
      onChange([...periods, editingPeriod])
    } else {
      onChange(periods.map((p) => (p.id === editingPeriod.id ? editingPeriod : p)))
    }
    setEditingPeriod(null)
  }

  function handleDelete(id: string) {
    onChange(periods.filter((p) => p.id !== id))
  }

  function handleToggleActive(id: string) {
    onChange(periods.map((p) => (p.id === id ? { ...p, active: !p.active } : p)))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Service Periods</h3>
          <p className="text-xs text-muted-foreground">Define when your restaurant accepts reservations.</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5 border-border/50 text-xs" onClick={handleAddNew}>
          <Plus className="h-3 w-3" />
          Add Period
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {periods.map((period) => (
          <Card
            key={period.id}
            className={`border-border/30 bg-secondary/30 p-4 backdrop-blur-sm transition-opacity ${!period.active ? "opacity-50" : ""}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/80">
                  {iconMap[period.icon] || <Clock className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{period.name}</span>
                    <Badge variant={period.active ? "default" : "secondary"} className={`text-[10px] ${period.active ? "bg-emerald-500/15 text-emerald-400" : ""}`}>
                      {period.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      {formatTime(period.startTime)} - {formatTime(period.endTime)}
                    </span>
                    <span>{formatDays(period.days)}</span>
                    <span>Max {period.maxCovers} covers</span>
                    <span>Last seating {formatTime(period.lastSeating)}</span>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Switch
                  checked={period.active}
                  onCheckedChange={() => handleToggleActive(period.id)}
                  aria-label={`Toggle ${period.name} active`}
                  className="scale-75"
                />
                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => handleEditOpen(period)}>
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(period.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit / Add Period Dialog */}
      <Dialog open={!!editingPeriod} onOpenChange={(open) => !open && setEditingPeriod(null)}>
        <DialogContent className="border-border/30 bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">{isNew ? "Add Service Period" : "Edit Service Period"}</DialogTitle>
          </DialogHeader>
          {editingPeriod && (
            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Period name</Label>
                <Input
                  value={editingPeriod.name}
                  onChange={(e) => setEditingPeriod({ ...editingPeriod, name: e.target.value })}
                  className="border-border/40 bg-secondary/50"
                  placeholder="e.g. Dinner"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Icon</Label>
                <Select value={editingPeriod.icon} onValueChange={(v) => setEditingPeriod({ ...editingPeriod, icon: v })}>
                  <SelectTrigger className="border-border/40 bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunrise">Sunrise</SelectItem>
                    <SelectItem value="cloud-sun">Cloud Sun</SelectItem>
                    <SelectItem value="sun">Sun</SelectItem>
                    <SelectItem value="moon">Moon</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">Start time</Label>
                  <Select value={editingPeriod.startTime} onValueChange={(v) => setEditingPeriod({ ...editingPeriod, startTime: v })}>
                    <SelectTrigger className="border-border/40 bg-secondary/50"><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-56">{timeSlots.map((t) => <SelectItem key={t} value={t}>{formatTime(t)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">End time</Label>
                  <Select value={editingPeriod.endTime} onValueChange={(v) => setEditingPeriod({ ...editingPeriod, endTime: v })}>
                    <SelectTrigger className="border-border/40 bg-secondary/50"><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-56">{timeSlots.map((t) => <SelectItem key={t} value={t}>{formatTime(t)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Last seating</Label>
                <Select value={editingPeriod.lastSeating} onValueChange={(v) => setEditingPeriod({ ...editingPeriod, lastSeating: v })}>
                  <SelectTrigger className="border-border/40 bg-secondary/50"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-56">{timeSlots.map((t) => <SelectItem key={t} value={t}>{formatTime(t)}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Active days</Label>
                <div className="flex flex-wrap gap-2">
                  {allDays.map((day) => (
                    <label key={day} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Checkbox
                        checked={editingPeriod.days.includes(day)}
                        onCheckedChange={(checked) => {
                          const days = checked ? [...editingPeriod.days, day] : editingPeriod.days.filter((d) => d !== day)
                          setEditingPeriod({ ...editingPeriod, days })
                        }}
                      />
                      {dayLabels[day]}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Max covers per period</Label>
                <Input
                  type="number"
                  value={editingPeriod.maxCovers}
                  onChange={(e) => setEditingPeriod({ ...editingPeriod, maxCovers: Number(e.target.value) })}
                  className="border-border/40 bg-secondary/50"
                />
                <p className="text-[10px] text-muted-foreground">Total restaurant capacity: 78 seats</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Slot interval</Label>
                <RadioGroup
                  value={String(editingPeriod.slotInterval)}
                  onValueChange={(v) => setEditingPeriod({ ...editingPeriod, slotInterval: Number(v) })}
                  className="flex gap-4"
                >
                  {[15, 30, 60].map((m) => (
                    <div key={m} className="flex items-center gap-1.5">
                      <RadioGroupItem value={String(m)} id={`slot-${m}`} />
                      <Label htmlFor={`slot-${m}`} className="text-xs text-muted-foreground">{m} min</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingPeriod(null)}>Cancel</Button>
            <Button onClick={handleSavePeriod} className="bg-emerald-600 text-white hover:bg-emerald-700">Save Period</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
