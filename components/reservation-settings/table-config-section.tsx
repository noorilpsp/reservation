"use client"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus } from "lucide-react"
import type { TableConfig } from "@/lib/reservation-settings-data"
import { tableFeatures } from "@/lib/reservation-settings-data"

interface Props {
  tables: TableConfig[]
  onChange: (tables: TableConfig[]) => void
}

export function TableConfigSection({ tables, onChange }: Props) {
  const zones = useMemo(() => {
    const zoneMap = new Map<string, { tables: TableConfig[]; totalSeats: number; servers: Set<string> }>()
    for (const t of tables) {
      if (!zoneMap.has(t.zone)) {
        zoneMap.set(t.zone, { tables: [], totalSeats: 0, servers: new Set() })
      }
      const z = zoneMap.get(t.zone)!
      z.tables.push(t)
      z.totalSeats += t.seats
      z.servers.add(t.server)
    }
    return zoneMap
  }, [tables])

  const totalTables = tables.length
  const totalSeats = tables.reduce((s, t) => s + t.seats, 0)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Table Configuration</h3>
        <p className="text-xs text-muted-foreground">Define your tables, zones, and seating capacity.</p>
      </div>

      {/* Zones Summary */}
      <Card className="border-border/30 bg-secondary/30 p-0 backdrop-blur-sm">
        <div className="flex items-center justify-between p-3 pb-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Zones</h4>
          <Button size="sm" variant="outline" className="h-6 gap-1 border-border/50 text-[10px]">
            <Plus className="h-3 w-3" />
            Add Zone
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/20">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Zone</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Tables</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Seats</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Server Section</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(zones.entries()).map(([zone, data]) => (
                <tr key={zone} className="border-b border-border/10 last:border-0">
                  <td className="px-3 py-2 font-medium text-foreground">{zone}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {data.tables[0]?.id}-{data.tables[data.tables.length - 1]?.id}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{data.totalSeats}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {Array.from(data.servers).join(", ")}
                  </td>
                </tr>
              ))}
              <tr className="bg-secondary/20">
                <td className="px-3 py-2 font-medium text-foreground">Total</td>
                <td className="px-3 py-2 text-muted-foreground">{zones.size} zones / {totalTables} tables</td>
                <td className="px-3 py-2 text-muted-foreground">{totalSeats} seats</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Table List */}
      <Card className="border-border/30 bg-secondary/30 p-0 backdrop-blur-sm">
        <div className="flex items-center justify-between p-3 pb-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Table List</h4>
          <Button size="sm" variant="outline" className="h-6 gap-1 border-border/50 text-[10px]">
            <Plus className="h-3 w-3" />
            Add Table
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/20">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Table</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Seats</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Min</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Max</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Zone</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Features</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {tables.map((table) => (
                <tr key={table.id} className="border-b border-border/10 last:border-0 hover:bg-secondary/20">
                  <td className="px-3 py-2 font-medium text-foreground">{table.id}</td>
                  <td className="px-3 py-2 text-muted-foreground">{table.seats}</td>
                  <td className="px-3 py-2 text-muted-foreground">{table.minCovers}</td>
                  <td className="px-3 py-2 text-muted-foreground">{table.maxCovers}</td>
                  <td className="px-3 py-2 text-muted-foreground">{table.zone}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {table.features.length === 0 ? (
                        <span className="text-muted-foreground/50">--</span>
                      ) : (
                        table.features.map((f) => (
                          <Badge key={f} variant="secondary" className="text-[9px] capitalize">{f}</Badge>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant="default" className="bg-emerald-500/15 text-[9px] text-emerald-400">
                      {table.active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Table Features */}
      <Card className="border-border/30 bg-secondary/30 p-4 backdrop-blur-sm">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Table Features (used for matching preferences)</h4>
        <div className="flex flex-wrap gap-2">
          {tableFeatures.map((f) => (
            <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
          ))}
        </div>
        <Button size="sm" variant="outline" className="mt-3 h-6 gap-1 border-border/50 text-[10px]">
          <Plus className="h-3 w-3" />
          Add Custom Feature
        </Button>
      </Card>
    </div>
  )
}
