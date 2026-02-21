"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  Ban,
  CalendarDays,
  CalendarPlus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ListPlus,
  Plus,
  UserPlus,
} from "lucide-react"

import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { ReservationDetailPanel } from "@/components/reservations/reservation-detail-panel"
import { ReservationFormView } from "@/components/reservations/reservation-form-view"
import { getReservationByStatus } from "@/lib/detail-modal-data"
import { cn } from "@/lib/utils"

type ServicePeriod = "lunch" | "dinner"

type QuickAction = {
  key: "new" | "walk-in" | "waitlist" | "block-table"
  label: string
  Icon: typeof CalendarPlus
}

type ReservationLens = {
  id: "overview" | "calendar" | "timeline" | "floorplan" | "list" | "waitlist"
  label: string
  href: string
}

const RESERVATION_LENSES: ReservationLens[] = [
  { id: "overview", label: "Overview", href: "/reservations" },
  { id: "calendar", label: "Calendar", href: "/reservations/calendar" },
  { id: "timeline", label: "Timeline", href: "/reservations/timeline" },
  { id: "floorplan", label: "Floor Plan", href: "/reservations/floorplan" },
  { id: "list", label: "List", href: "/reservations/list" },
  { id: "waitlist", label: "Waitlist", href: "/reservations/waitlist" },
]

const QUICK_ACTIONS: QuickAction[] = [
  { key: "new", label: "New Reservation", Icon: CalendarPlus },
  { key: "walk-in", label: "Add Walk-in", Icon: UserPlus },
  { key: "waitlist", label: "Add to Waitlist", Icon: ListPlus },
  { key: "block-table", label: "Block Table", Icon: Ban },
]

const SERVICE_PERIODS = [
  { id: "lunch" as ServicePeriod, label: "Lunch", time: "11:30 AM - 3:00 PM" },
  { id: "dinner" as ServicePeriod, label: "Dinner", time: "5:00 PM - 11:00 PM" },
]

const TODAY_ISO = "2025-01-17"

interface ReservationsShellLayoutProps {
  children: ReactNode
}

function formatDayLabel(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`)
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export function ReservationsShellLayout({ children }: ReservationsShellLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isDesktop = useMediaQuery("(min-width: 1280px)")

  const [selectedDate, setSelectedDate] = useState(TODAY_ISO)
  const [servicePeriod, setServicePeriod] = useState<ServicePeriod>("dinner")

  const indicatorContainerRef = useRef<HTMLDivElement | null>(null)
  const tabRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; visible: boolean }>({
    left: 0,
    width: 0,
    visible: false,
  })

  const activeLens = useMemo(() => {
    return RESERVATION_LENSES.find((lens) => pathname === lens.href) ?? RESERVATION_LENSES[0]
  }, [pathname])

  const action = searchParams.get("action")
  const detail = searchParams.get("detail")
  const isActionOpen = action === "new" || action === "edit"
  const isDetailOpen = Boolean(detail)

  const selectedService =
    SERVICE_PERIODS.find((period) => period.id === servicePeriod) ?? SERVICE_PERIODS[1]

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

  const openAction = useCallback(
    (mode: "new" | "edit", options?: { draft?: string; id?: string }) => {
      updateSearch((next) => {
        next.set("action", mode)
        if (options?.id) next.set("id", options.id)
        else next.delete("id")

        if (options?.draft) next.set("draft", options.draft)
        else next.delete("draft")
      })
    },
    [updateSearch]
  )

  const closeAction = useCallback(() => {
    updateSearch((next) => {
      next.delete("action")
      next.delete("id")
      next.delete("draft")
    })
  }, [updateSearch])

  useEffect(() => {
    const savedDate = window.localStorage.getItem("reservations.shell.date")
    const savedPeriod = window.localStorage.getItem("reservations.shell.period")

    if (savedDate) setSelectedDate(savedDate)
    if (savedPeriod === "lunch" || savedPeriod === "dinner") {
      setServicePeriod(savedPeriod)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem("reservations.shell.date", selectedDate)
  }, [selectedDate])

  useEffect(() => {
    window.localStorage.setItem("reservations.shell.period", servicePeriod)
  }, [servicePeriod])

  const refreshIndicator = useCallback(() => {
    const activeNode = tabRefs.current[activeLens.href]
    if (!activeNode || !indicatorContainerRef.current) {
      setIndicatorStyle((prev) => ({ ...prev, visible: false }))
      return
    }

    setIndicatorStyle({
      left: activeNode.offsetLeft,
      width: activeNode.offsetWidth,
      visible: true,
    })
  }, [activeLens.href])

  useEffect(() => {
    refreshIndicator()
    window.addEventListener("resize", refreshIndicator)
    return () => window.removeEventListener("resize", refreshIndicator)
  }, [refreshIndicator])

  const reservation = getReservationByStatus("arriving")

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-zinc-950">
      <header className="sticky top-0 z-40 border-b border-zinc-800/60 bg-zinc-950/85 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <div>
            <h1 className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
              <CalendarDays className="h-4 w-4 text-emerald-400" />
              Reservations
            </h1>
            <p className="mt-0.5 text-xs text-zinc-400">
              {formatDayLabel(selectedDate)} · {selectedService.label} ({selectedService.time})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
              aria-label="Previous day"
              onClick={() => setSelectedDate((prev) => addDays(prev, -1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {selectedDate !== TODAY_ISO && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-zinc-700 bg-zinc-900 text-zinc-100"
                onClick={() => setSelectedDate(TODAY_ISO)}
              >
                Today
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
              aria-label="Next day"
              onClick={() => setSelectedDate((prev) => addDays(prev, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-zinc-700 bg-zinc-900 text-zinc-100"
                >
                  {selectedService.label}
                  <ChevronDown className="ml-1 h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900 text-zinc-100">
                {SERVICE_PERIODS.map((period) => (
                  <DropdownMenuItem
                    key={period.id}
                    className="focus:bg-zinc-800 focus:text-zinc-100"
                    onClick={() => setServicePeriod(period.id)}
                  >
                    {period.label} ({period.time})
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-8 bg-emerald-600 text-emerald-50 hover:bg-emerald-500">
                  <Plus className="mr-1.5 h-4 w-4" />
                  New Reservation
                  <ChevronDown className="ml-1 h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 border-zinc-800 bg-zinc-900 text-zinc-100">
                {QUICK_ACTIONS.map((item) => (
                  <DropdownMenuItem
                    key={item.key}
                    className="focus:bg-zinc-800 focus:text-zinc-100"
                    onClick={() =>
                      openAction("new", {
                        draft: item.key,
                      })
                    }
                  >
                    <item.Icon className="mr-2 h-4 w-4 text-emerald-400" />
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="relative border-t border-zinc-800/60 px-4 lg:px-6">
          <div
            ref={indicatorContainerRef}
            className="relative flex overflow-x-auto whitespace-nowrap scrollbar-none"
            role="tablist"
            aria-label="Reservation views"
          >
            {RESERVATION_LENSES.map((lens) => {
              const selected = activeLens.href === lens.href
              return (
                <Link
                  key={lens.id}
                  href={lens.href}
                  ref={(node) => {
                    tabRefs.current[lens.href] = node
                  }}
                  role="tab"
                  aria-selected={selected}
                  className={cn(
                    "relative z-10 h-10 shrink-0 px-3 text-xs font-medium transition-colors",
                    selected ? "text-emerald-400" : "text-zinc-400 hover:text-zinc-100"
                  )}
                >
                  <span className="inline-flex h-full items-center">{lens.label}</span>
                </Link>
              )
            })}
            <span
              aria-hidden="true"
              className={cn(
                "absolute bottom-0 h-0.5 rounded bg-emerald-500 transition-all duration-200",
                indicatorStyle.visible ? "opacity-100" : "opacity-0"
              )}
              style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
            />
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1">{children}</div>

      <ReservationDetailPanel
        reservation={reservation}
        open={isDetailOpen}
        onClose={closeDetail}
      />

      <Dialog open={isActionOpen && isDesktop} onOpenChange={(open) => !open && closeAction()}>
        <DialogContent className="w-[min(1200px,96vw)] max-w-none overflow-hidden border-zinc-800 bg-zinc-950 p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{action === "edit" ? "Edit Reservation" : "New Reservation"}</DialogTitle>
            <DialogDescription>Reservation form</DialogDescription>
          </DialogHeader>
          <div className="h-[88vh]">
            <ReservationFormView mode={action === "edit" ? "edit" : "create"} />
          </div>
        </DialogContent>
      </Dialog>

      <Sheet open={isActionOpen && !isDesktop} onOpenChange={(open) => !open && closeAction()}>
        <SheetContent side="bottom" className="h-[96dvh] border-zinc-800 bg-zinc-950 p-0">
          <div className="h-full">
            <ReservationFormView mode={action === "edit" ? "edit" : "create"} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
