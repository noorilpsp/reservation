"use client"

import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Bell, MonitorDot, Volume2 } from "lucide-react"
import type { NotificationSettings } from "@/lib/reservation-settings-data"

interface Props {
  notifications: NotificationSettings
  onChange: (n: NotificationSettings) => void
}

const timeSlots: string[] = []
for (let h = 0; h < 24; h++) {
  for (const m of [0, 30]) {
    timeSlots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`)
  }
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number)
  const ampm = h >= 12 ? "PM" : "AM"
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`
}

export function NotificationsSection({ notifications, onChange }: Props) {
  function updateEvent(idx: number, field: "push" | "sound" | "dashboard", val: boolean) {
    const events = notifications.events.map((e, i) => (i === idx ? { ...e, [field]: val } : e))
    onChange({ ...notifications, events })
  }

  const { quietHours } = notifications

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Staff Notifications</h3>
        <p className="text-xs text-muted-foreground">What alerts should staff receive and how.</p>
      </div>

      {/* Notification Events Table */}
      <Card className="border-border/30 bg-secondary/30 p-0 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/20">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Event</th>
                <th className="w-16 px-2 py-3 text-center font-medium text-muted-foreground">
                  <div className="flex flex-col items-center gap-0.5">
                    <Bell className="h-3 w-3" />
                    <span className="text-[9px]">Push</span>
                  </div>
                </th>
                <th className="w-16 px-2 py-3 text-center font-medium text-muted-foreground">
                  <div className="flex flex-col items-center gap-0.5">
                    <Volume2 className="h-3 w-3" />
                    <span className="text-[9px]">Sound</span>
                  </div>
                </th>
                <th className="w-16 px-2 py-3 text-center font-medium text-muted-foreground">
                  <div className="flex flex-col items-center gap-0.5">
                    <MonitorDot className="h-3 w-3" />
                    <span className="text-[9px]">Dash</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {notifications.events.map((evt, idx) => (
                <tr key={evt.event} className="border-b border-border/10 last:border-0">
                  <td className="px-4 py-2.5 text-muted-foreground">{evt.label}</td>
                  <td className="px-2 py-2.5 text-center">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={evt.push}
                        onCheckedChange={(c) => updateEvent(idx, "push", !!c)}
                        aria-label={`${evt.label} push notification`}
                      />
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-center">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={evt.sound}
                        onCheckedChange={(c) => updateEvent(idx, "sound", !!c)}
                        aria-label={`${evt.label} sound`}
                      />
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-center">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={evt.dashboard}
                        onCheckedChange={(c) => updateEvent(idx, "dashboard", !!c)}
                        aria-label={`${evt.label} dashboard`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quiet Hours */}
      <Card className="border-border/30 bg-secondary/30 p-4 backdrop-blur-sm">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quiet Hours</h4>
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Switch
              checked={quietHours.enabled}
              onCheckedChange={(c) => onChange({ ...notifications, quietHours: { ...quietHours, enabled: c } })}
              className="scale-75"
              aria-label="Enable quiet hours"
            />
            Enable quiet hours (suppress non-urgent alerts)
          </label>
          {quietHours.enabled && (
            <>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Quiet period:</Label>
                <Select value={quietHours.start} onValueChange={(v) => onChange({ ...notifications, quietHours: { ...quietHours, start: v } })}>
                  <SelectTrigger className="h-7 w-28 border-border/30 bg-secondary/50 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-48">{timeSlots.map((t) => <SelectItem key={t} value={t}>{formatTime(t)}</SelectItem>)}</SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground">to</span>
                <Select value={quietHours.end} onValueChange={(v) => onChange({ ...notifications, quietHours: { ...quietHours, end: v } })}>
                  <SelectTrigger className="h-7 w-28 border-border/30 bg-secondary/50 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-48">{timeSlots.map((t) => <SelectItem key={t} value={t}>{formatTime(t)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Exceptions:</Label>
                <div className="flex gap-3">
                  {["no_show", "cancellation"].map((exc) => (
                    <label key={exc} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Checkbox
                        checked={quietHours.exceptions.includes(exc)}
                        onCheckedChange={(c) => {
                          const exceptions = c ? [...quietHours.exceptions, exc] : quietHours.exceptions.filter((e) => e !== exc)
                          onChange({ ...notifications, quietHours: { ...quietHours, exceptions } })
                        }}
                      />
                      {exc.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
