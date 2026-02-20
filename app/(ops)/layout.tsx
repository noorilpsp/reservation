import type { ReactNode } from "react"

import { OpsBottomNav } from "@/components/navigation/ops-bottom-nav"

export default function OpsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <div className="h-dvh min-h-0 overflow-hidden pb-[calc(4.5rem+env(safe-area-inset-bottom))]">{children}</div>
      <OpsBottomNav />
    </div>
  )
}
