import { AlertTriangle } from "lucide-react"
import { dietaryIcons } from "@/lib/take-order-data"
import type { Seat } from "@/lib/take-order-data"

interface AllergyAlertProps {
  seat: Seat
}

export function AllergyAlert({ seat }: AllergyAlertProps) {
  const allergies = seat.dietary.filter((d) => d.includes("allergy"))

  if (allergies.length === 0) return null

  const allergyLabels = allergies
    .map((a) => dietaryIcons[a]?.label || a.replace("_", " ").toUpperCase())
    .join(", ")

  return (
    <div className="flex items-center gap-3 border-b border-warning/20 bg-warning/10 px-4 py-2.5 text-warning-foreground">
      <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
      <p className="text-sm font-medium">
        <span className="font-semibold">Seat {seat.number}</span> has{" "}
        <span className="font-semibold">{allergyLabels}</span> — Items with allergens
        will be flagged
      </p>
    </div>
  )
}
