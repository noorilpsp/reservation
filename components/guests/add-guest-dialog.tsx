"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface AddGuestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const allergyOptions = [
  { key: "shellfish", label: "Shellfish" },
  { key: "nuts", label: "Nuts" },
  { key: "gluten", label: "Gluten" },
  { key: "dairy", label: "Dairy" },
  { key: "eggs", label: "Eggs" },
  { key: "vegan", label: "Vegan" },
  { key: "vegetarian", label: "Vegetarian" },
]

const tagOptions = [
  { key: "vip", label: "VIP" },
  { key: "high-value", label: "High-value" },
  { key: "business", label: "Business" },
  { key: "celebration", label: "Celebrates" },
  { key: "first-timer", label: "First-timer" },
]

export function AddGuestDialog({ open, onOpenChange }: AddGuestDialogProps) {
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  function toggleItem(list: string[], setter: (v: string[]) => void, key: string) {
    setter(list.includes(key) ? list.filter(k => k !== key) : [...list, key])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto border-border/50 bg-card/95 backdrop-blur-xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Guest</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          {/* Basic Info */}
          {["Name *", "Phone *", "Email"].map((label) => (
            <div key={label} className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">{label}</label>
              <input
                type={label === "Email" ? "email" : "text"}
                className="rounded-lg border border-border/40 bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                placeholder={label.replace(" *", "")}
              />
            </div>
          ))}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            {["Birthday", "Anniversary"].map((label) => (
              <div key={label} className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">{label}</label>
                <input
                  type="date"
                  className="rounded-lg border border-border/40 bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40 [color-scheme:dark]"
                />
              </div>
            ))}
          </div>

          {/* Allergies */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Allergies & Dietary</label>
            <div className="flex flex-wrap gap-1.5">
              {allergyOptions.map((opt) => (
                <Badge
                  key={opt.key}
                  variant="outline"
                  className={cn(
                    "cursor-pointer transition-all",
                    selectedAllergies.includes(opt.key)
                      ? "border-rose-500/40 bg-rose-500/15 text-rose-300"
                      : "border-border/40 text-muted-foreground hover:border-border/60"
                  )}
                  onClick={() => toggleItem(selectedAllergies, setSelectedAllergies, opt.key)}
                >
                  {opt.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Severity */}
          {selectedAllergies.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Allergy Severity</label>
              <select className="rounded-lg border border-border/40 bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none [color-scheme:dark]">
                <option>Mild</option>
                <option>Moderate</option>
                <option>Severe</option>
              </select>
            </div>
          )}

          {/* Preferences */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Seating", options: ["No Preference", "Window", "Booth", "Quiet Area"] },
              { label: "Zone", options: ["No Preference", "Main", "Patio", "Private"] },
              { label: "Server", options: ["No Preference", "Mike", "Anna", "Carlos"] },
            ].map((field) => (
              <div key={field.label} className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
                <select className="rounded-lg border border-border/40 bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none [color-scheme:dark]">
                  {field.options.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {tagOptions.map((opt) => (
                <Badge
                  key={opt.key}
                  variant="outline"
                  className={cn(
                    "cursor-pointer transition-all",
                    selectedTags.includes(opt.key)
                      ? "border-primary/40 bg-primary/15 text-primary"
                      : "border-border/40 text-muted-foreground hover:border-border/60"
                  )}
                  onClick={() => toggleItem(selectedTags, setSelectedTags, opt.key)}
                >
                  {opt.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Notes</label>
            <textarea
              rows={3}
              className="rounded-lg border border-border/40 bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/40"
              placeholder="Any notes about this guest..."
            />
          </div>

          {/* Source */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Source</label>
            <select className="rounded-lg border border-border/40 bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none [color-scheme:dark]">
              {["Walk-in", "Phone", "Website", "Google", "Referral", "Other"].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 border-t border-border/30 pt-4">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button className="bg-emerald-600 text-emerald-50 hover:bg-emerald-500">Save Guest</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
