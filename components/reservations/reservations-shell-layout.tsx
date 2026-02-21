"use client"

import { useCallback, useMemo, type ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  Calendar,
  Clock3,
  GanttChart,
  LayoutDashboard,
  List as ListIcon,
  Map,
} from "lucide-react"

import { useMediaQuery } from "@/hooks/use-media-query"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ReservationDetailPanel } from "@/components/reservations/reservation-detail-panel"
import { ReservationFormView } from "@/components/reservations/reservation-form-view"
import { getReservationByStatus } from "@/lib/detail-modal-data"
import {
  capacitySlots,
  reservations,
  restaurantConfig,
} from "@/lib/reservations-data"
import { activeWaitlist } from "@/lib/waitlist-data"
import { cn } from "@/lib/utils"

type ReservationLens = {
  id: "overview" | "calendar" | "timeline" | "floorplan" | "list" | "waitlist"
  label: string
  href: string
}

type LensMetric = {
  value: string
}

const RESERVATION_LENSES: ReservationLens[] = [
  { id: "overview", label: "Overview", href: "/reservations" },
  { id: "calendar", label: "Calendar", href: "/reservations/calendar" },
  { id: "timeline", label: "Timeline", href: "/reservations/timeline" },
  { id: "floorplan", label: "Floor Plan", href: "/reservations/floorplan" },
  { id: "list", label: "List", href: "/reservations/list" },
  { id: "waitlist", label: "Waitlist", href: "/reservations/waitlist" },
]

const LENS_ICONS: Record<ReservationLens["id"], typeof LayoutDashboard> = {
  overview: LayoutDashboard,
  calendar: Calendar,
  timeline: GanttChart,
  floorplan: Map,
  list: ListIcon,
  waitlist: Clock3,
}

interface ReservationsShellLayoutProps {
  children: ReactNode
}

function timeToMinutes(time24: string): number {
  const [h, m] = time24.split(":").map(Number)
  return h * 60 + m
}

export function ReservationsShellLayout({ children }: ReservationsShellLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isDesktop = useMediaQuery("(min-width: 1280px)")

  const activeLens = useMemo(() => {
    return RESERVATION_LENSES.find((lens) => pathname === lens.href) ?? RESERVATION_LENSES[0]
  }, [pathname])

  const action = searchParams.get("action")
  const detail = searchParams.get("detail")
  const isActionOpen = action === "new" || action === "edit"
  const isDetailOpen = Boolean(detail)
  const prefillDate = searchParams.get("date")
  const prefillTime = searchParams.get("time")
  const prefillTable = searchParams.get("table")
  const prefillService = searchParams.get("service")
  const prefillPartySizeRaw = searchParams.get("partySize")
  const prefillDurationRaw = searchParams.get("duration")
  const prefillDurationMaxRaw = searchParams.get("durationMax")
  const prefillPartySize = prefillPartySizeRaw ? Number.parseInt(prefillPartySizeRaw, 10) : undefined
  const prefillDuration = prefillDurationRaw ? Number.parseInt(prefillDurationRaw, 10) : undefined
  const prefillDurationMax = prefillDurationMaxRaw ? Number.parseInt(prefillDurationMaxRaw, 10) : undefined
  const mode = action === "edit" ? "edit" : "create"
  const prefill =
    action === "new"
      ? {
          date: prefillDate ?? undefined,
          time: prefillTime ?? undefined,
          assignedTable: prefillTable ?? undefined,
          servicePeriodId: prefillService ?? undefined,
          partySize: Number.isFinite(prefillPartySize) ? prefillPartySize : undefined,
          duration: Number.isFinite(prefillDuration) ? prefillDuration : undefined,
          durationMax: Number.isFinite(prefillDurationMax) ? prefillDurationMax : undefined,
        }
      : undefined
  const formRenderKey = `${mode}:${prefillDate ?? ""}:${prefillTime ?? ""}:${prefillTable ?? ""}:${prefillService ?? ""}:${prefillPartySize ?? ""}:${prefillDuration ?? ""}:${prefillDurationMax ?? ""}`

  const shellMetrics = useMemo(() => {
    const nowMinutes = timeToMinutes(restaurantConfig.currentTime)
    const currentSlot =
      capacitySlots.find((slot) => timeToMinutes(slot.time) <= nowMinutes && nowMinutes < timeToMinutes(slot.time) + 30) ??
      capacitySlots.reduce((closest, slot) => {
        const distance = Math.abs(timeToMinutes(slot.time) - nowMinutes)
        const bestDistance = Math.abs(timeToMinutes(closest.time) - nowMinutes)
        return distance < bestDistance ? slot : closest
      }, capacitySlots[0])

    const activeReservations = reservations.filter(
      (res) =>
        res.status === "confirmed" ||
        res.status === "late"
    ).length

    const lensMetrics: Record<ReservationLens["id"], LensMetric> = {
      overview: {
        value: `${currentSlot.occupancyPct}%`,
      },
      calendar: {
        value: `${reservations.length}`,
      },
      timeline: {
        value: `${currentSlot.arrivingReservations}`,
      },
      floorplan: {
        value: `${currentSlot.predictedTurns}`,
      },
      list: {
        value: `${activeReservations}`,
      },
      waitlist: {
        value: `${activeWaitlist.length}`,
      },
    }

    return { lensMetrics }
  }, [])

  const updateSearch = useCallback(
    (mutate: (next: URLSearchParams) => void) => {
      const next = new URLSearchParams(searchParams.toString())
      mutate(next)
      const query = next.toString()
      const href = query ? `${pathname}?${query}` : pathname
      router.push(href, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const closeDetail = useCallback(() => {
    updateSearch((next) => {
      next.delete("detail")
    })
  }, [updateSearch])

  const closeAction = useCallback(() => {
    updateSearch((next) => {
      next.delete("action")
      next.delete("id")
      next.delete("draft")
      next.delete("time")
      next.delete("date")
      next.delete("table")
      next.delete("service")
      next.delete("partySize")
      next.delete("duration")
      next.delete("durationMax")
    })
  }, [updateSearch])

  const reservation = getReservationByStatus("arriving")

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-zinc-950">
      <header className="sticky top-0 z-40 border-b border-zinc-800/60 bg-zinc-950/85 backdrop-blur-xl">
        <div className="px-1 py-1.5 md:px-2 lg:px-3">
          <div className="overflow-x-auto scrollbar-none">
            <div className="mx-auto flex w-max items-center gap-1" role="tablist" aria-label="Reservation views">
              {RESERVATION_LENSES.map((lens) => {
                const selected = activeLens.href === lens.href
                const lensMetric = shellMetrics.lensMetrics[lens.id]
                const LensIcon = LENS_ICONS[lens.id]
                return (
                  <Link
                    key={lens.id}
                    href={lens.href}
                    role="tab"
                    aria-selected={selected}
                    className={cn(
                      "group inline-flex h-6 shrink-0 items-center gap-1 rounded-full border px-2 text-[10px] font-medium transition-all",
                      selected
                        ? "border-emerald-400/70 bg-[linear-gradient(135deg,rgba(16,185,129,0.22),rgba(16,185,129,0.08))] text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.28)]"
                        : "border-zinc-800/80 bg-zinc-900/70 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/90 hover:text-zinc-200"
                    )}
                  >
                    <LensIcon className={cn("h-3 w-3", selected ? "text-emerald-300" : "text-zinc-500")} />
                    <span>{lens.label}</span>
                    <span
                      className={cn(
                        "rounded-full px-1 py-0 text-[9px] font-semibold tabular-nums",
                        selected ? "bg-emerald-500/20 text-emerald-200" : "bg-zinc-800/80 text-zinc-400"
                      )}
                    >
                      {lensMetric.value}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

      </header>

      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>

      <ReservationDetailPanel
        reservation={reservation}
        open={isDetailOpen}
        onClose={closeDetail}
      />

      <Dialog open={isActionOpen && isDesktop} onOpenChange={(open) => !open && closeAction()}>
        <DialogContent showClose={false} className="w-[min(1200px,96vw)] max-w-none overflow-hidden border-zinc-800 bg-zinc-950 p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{action === "edit" ? "Edit Reservation" : "New Reservation"}</DialogTitle>
            <DialogDescription>Reservation form</DialogDescription>
          </DialogHeader>
          <div className="h-[88vh]">
            <ReservationFormView
              key={formRenderKey}
              mode={mode}
              prefill={prefill}
              onRequestClose={closeAction}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Sheet open={isActionOpen && !isDesktop} onOpenChange={(open) => !open && closeAction()}>
        <SheetContent showClose={false} side="bottom" className="h-[96dvh] border-zinc-800 bg-zinc-950 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>{action === "edit" ? "Edit Reservation" : "New Reservation"}</SheetTitle>
            <SheetDescription>Reservation form</SheetDescription>
          </SheetHeader>
          <div className="h-full">
            <ReservationFormView
              key={`${formRenderKey}:mobile`}
              mode={mode}
              prefill={prefill}
              onRequestClose={closeAction}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
