"use client"

import { Armchair } from "lucide-react"

export function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
        <Armchair className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">
        No tables yet
      </h2>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        {"You'll see your tables here once guests are seated in your section."}
      </p>
    </div>
  )
}
