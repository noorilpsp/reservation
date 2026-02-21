import { Suspense, type ReactNode } from "react"

import { ReservationsShellLayout } from "@/components/reservations/reservations-shell-layout"

export default function ReservationsLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="h-full bg-zinc-950" />}>
      <ReservationsShellLayout>{children}</ReservationsShellLayout>
    </Suspense>
  )
}
