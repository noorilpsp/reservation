"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  Ban,
  BarChart3,
  Bell,
  Calendar,
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  GanttChart,
  GripHorizontal,
  LayoutDashboard,
  Link as LinkIcon,
  List,
  ListPlus,
  Map,
  Menu,
  MessageSquare,
  MoreHorizontal,
  PinIcon,
  Plus,
  Settings,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type PrimarySectionId =
  | "reservations"
  | "guests"
  | "tables"
  | "messages"
  | "analytics"
  | "settings"

type ReservationSubviewId =
  | "overview"
  | "calendar"
  | "timeline"
  | "floorplan"
  | "list"
  | "waitlist"

type QuickActionId = "new_reservation" | "walk_in" | "waitlist" | "block_table"
type ServicePeriodId = "lunch" | "dinner"
type DetailSnap = "peek" | "half" | "full"

interface NavItem {
  id: PrimarySectionId
  label: string
  path: string
  badge: number | null
}

interface ReservationSubview {
  id: ReservationSubviewId
  label: string
  path: string
}

interface QuickAction {
  id: QuickActionId
  label: string
}

interface ServicePeriod {
  id: ServicePeriodId
  label: string
  time: string
}

interface ViewPlaceholder {
  id: string
  title: string
  color: string
  description: string
}

const navigationItems: NavItem[] = [
  { id: "reservations", label: "Reservations", path: "/reservations", badge: null },
  { id: "guests", label: "Guests", path: "/guests", badge: null },
  { id: "tables", label: "Tables", path: "/merge-split", badge: null },
  { id: "messages", label: "Messages", path: "/communications", badge: 3 },
  { id: "analytics", label: "Analytics", path: "/analytics", badge: null },
  { id: "settings", label: "Settings", path: "/reservation-settings", badge: null },
]

const reservationSubViews: ReservationSubview[] = [
  { id: "overview", label: "Overview", path: "/reservations" },
  { id: "calendar", label: "Calendar", path: "/reservations/calendar" },
  { id: "timeline", label: "Timeline", path: "/reservations/timeline" },
  { id: "floorplan", label: "Floor Plan", path: "/reservations/floorplan" },
  { id: "list", label: "List", path: "/reservations/list" },
  { id: "waitlist", label: "Waitlist", path: "/reservations/waitlist" },
]

const quickActions: QuickAction[] = [
  { id: "new_reservation", label: "New Reservation" },
  { id: "walk_in", label: "Add Walk-in" },
  { id: "waitlist", label: "Add to Waitlist" },
  { id: "block_table", label: "Block Table" },
]

const currentContext = {
  date: "2025-01-17",
  servicePeriod: "dinner" as ServicePeriodId,
  availablePeriods: [
    { id: "lunch" as ServicePeriodId, label: "Lunch", time: "11:30 AM - 3:00 PM" },
    { id: "dinner" as ServicePeriodId, label: "Dinner", time: "5:00 PM - 11:00 PM" },
  ],
}

const sampleUser = {
  name: "Maria",
  role: "Host",
  restaurant: "Chez Laurent",
}

const sampleReservation = {
  id: "res_042",
  guest: "Sarah Chen",
  partySize: 4,
  time: "19:30",
  table: "T12",
  zone: "Main Dining",
  status: "confirmed",
  tags: ["birthday", "window-request", "shellfish-allergy"],
  server: "Mike",
  phone: "+32 0412 345 678",
  notes: "Birthday celebration, shellfish allergy. Prefers window.",
  createdVia: "online",
  createdAt: "2025-01-15T10:30:00",
}

const viewPlaceholders: ViewPlaceholder[] = [
  { id: "reservations", title: "Dashboard Overview", color: "emerald", description: "KPI cards, tonight's summary, upcoming reservations" },
  { id: "calendar", title: "Calendar View", color: "blue", description: "Month/week grid with reservation counts per day" },
  { id: "timeline", title: "Timeline (River)", color: "cyan", description: "Time x table grid showing reservation blocks" },
  { id: "floorplan", title: "Floor Plan", color: "violet", description: "Spatial table map with status overlays" },
  { id: "list", title: "List View", color: "amber", description: "Filterable, sortable table of all reservations" },
  { id: "waitlist", title: "Waitlist", color: "rose", description: "Queue management with wait time estimates" },
  { id: "guests", title: "Guest Profiles", color: "pink", description: "CRM with VIP intelligence and visit history" },
  { id: "merge-split", title: "Table Merge & Split", color: "orange", description: "Visual table combination manager" },
  { id: "communications", title: "Communications", color: "teal", description: "Message feed, templates, automations" },
  { id: "analytics", title: "Analytics", color: "indigo", description: "Charts, trends, no-show analysis, RevPASH" },
  { id: "reservation-settings", title: "Settings", color: "zinc", description: "Service periods, turn times, policies, table config" },
]

const primaryIcons: Record<PrimarySectionId, React.ComponentType<{ className?: string }>> = {
  reservations: CalendarDays,
  guests: Users,
  tables: LinkIcon,
  messages: MessageSquare,
  analytics: BarChart3,
  settings: Settings,
}

const subviewIcons: Record<ReservationSubviewId, React.ComponentType<{ className?: string }>> = {
  overview: LayoutDashboard,
  calendar: Calendar,
  timeline: GanttChart,
  floorplan: Map,
  list: List,
  waitlist: Clock,
}

const quickActionIcons: Record<QuickActionId, React.ComponentType<{ className?: string }>> = {
  new_reservation: CalendarPlus,
  walk_in: UserPlus,
  waitlist: ListPlus,
  block_table: Ban,
}

const colorBlockMap: Record<string, string> = {
  emerald: "from-emerald-500/30 to-emerald-700/10 border-emerald-500/30",
  blue: "from-blue-500/30 to-blue-700/10 border-blue-500/30",
  cyan: "from-cyan-500/30 to-cyan-700/10 border-cyan-500/30",
  violet: "from-violet-500/30 to-violet-700/10 border-violet-500/30",
  amber: "from-amber-500/30 to-amber-700/10 border-amber-500/30",
  rose: "from-rose-500/30 to-rose-700/10 border-rose-500/30",
  pink: "from-pink-500/30 to-pink-700/10 border-pink-500/30",
  orange: "from-orange-500/30 to-orange-700/10 border-orange-500/30",
  teal: "from-teal-500/30 to-teal-700/10 border-teal-500/30",
  indigo: "from-indigo-500/30 to-indigo-700/10 border-indigo-500/30",
  zinc: "from-zinc-500/30 to-zinc-700/10 border-zinc-500/30",
}

const MOBILE_NAV: Array<{ id: string; label: string; icon: React.ComponentType<{ className?: string }>; path?: string }> = [
  { id: "reservations", label: "Res", icon: CalendarDays, path: "/reservations" },
  { id: "guests", label: "Guests", icon: Users, path: "/guests" },
  { id: "messages", label: "Msgs", icon: MessageSquare, path: "/communications" },
  { id: "analytics", label: "Stats", icon: BarChart3, path: "/analytics" },
  { id: "more", label: "More", icon: MoreHorizontal },
]

function normalizePath(path: string | null): string {
  if (!path) return "/reservations"
  if (!path.startsWith("/")) return "/reservations"
  return path
}

function getPrimaryFromPath(path: string): PrimarySectionId {
  if (path.startsWith("/reservations")) return "reservations"
  if (path.startsWith("/guests")) return "guests"
  if (path.startsWith("/merge-split")) return "tables"
  if (path.startsWith("/communications")) return "messages"
  if (path.startsWith("/analytics")) return "analytics"
  return "settings"
}

function getPlaceholderId(path: string): string {
  if (path === "/reservations") return "reservations"
  if (path === "/reservations/calendar") return "calendar"
  if (path === "/reservations/timeline") return "timeline"
  if (path === "/reservations/floorplan") return "floorplan"
  if (path === "/reservations/list") return "list"
  if (path === "/reservations/waitlist") return "waitlist"
  if (path.startsWith("/guests")) return "guests"
  if (path.startsWith("/merge-split")) return "merge-split"
  if (path.startsWith("/communications")) return "communications"
  if (path.startsWith("/analytics")) return "analytics"
  return "reservation-settings"
}

function formatDayLabel(dateIso: string): string {
  const d = new Date(`${dateIso}T00:00:00`)
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

function formatLongDate(dateIso: string): string {
  const d = new Date(`${dateIso}T00:00:00`)
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  })
}

function ShellDemoPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isDesktop = useMediaQuery("(min-width: 1280px)")
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1279px)")
  const isMobile = useMediaQuery("(max-width: 767px)")

  const activePath = normalizePath(searchParams.get("path"))
  const primary = getPrimaryFromPath(activePath)
  const detailId = searchParams.get("detail")
  const action = searchParams.get("action")
  const draft = searchParams.get("draft")
  const editId = searchParams.get("id")

  const [liveMessage, setLiveMessage] = useState("")
  const [sidebarPinned, setSidebarPinned] = useState(false)
  const [sidebarHover, setSidebarHover] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [quickActionsOpen, setQuickActionsOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [detailSnap, setDetailSnap] = useState<DetailSnap>("half")
  const [formDirty, setFormDirty] = useState(false)
  const [lastReservationsPath, setLastReservationsPath] = useState("/reservations")
  const [dateIso, setDateIso] = useState(currentContext.date)
  const [servicePeriod, setServicePeriod] = useState<ServicePeriodId>(currentContext.servicePeriod)

  const isDetailOpen = Boolean(detailId)
  const isActionOpen = action === "new" || action === "edit"

  const serviceOptions: ServicePeriod[] = currentContext.availablePeriods

  const activePlaceholder = useMemo(() => {
    const id = getPlaceholderId(activePath)
    return viewPlaceholders.find((v) => v.id === id) ?? viewPlaceholders[0]
  }, [activePath])

  const setParams = useCallback(
    (updater: (next: URLSearchParams) => void) => {
      const next = new URLSearchParams(searchParams.toString())
      updater(next)
      const qs = next.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname)
    },
    [pathname, router, searchParams]
  )

  const announce = useCallback((message: string) => {
    setLiveMessage("")
    window.setTimeout(() => setLiveMessage(message), 10)
  }, [])

  useEffect(() => {
    const pinned = window.localStorage.getItem("shell.sidebar.pinned")
    const lastPath = window.localStorage.getItem("shell.reservations.lastPath")
    const savedDate = window.localStorage.getItem("shell.context.date")
    const savedPeriod = window.localStorage.getItem("shell.context.period") as ServicePeriodId | null

    if (pinned === "true") setSidebarPinned(true)
    if (lastPath && lastPath.startsWith("/reservations")) setLastReservationsPath(lastPath)
    if (savedDate) setDateIso(savedDate)
    if (savedPeriod === "lunch" || savedPeriod === "dinner") setServicePeriod(savedPeriod)
  }, [])

  useEffect(() => {
    window.localStorage.setItem("shell.sidebar.pinned", String(sidebarPinned))
  }, [sidebarPinned])

  useEffect(() => {
    if (activePath.startsWith("/reservations")) {
      setLastReservationsPath(activePath)
      window.localStorage.setItem("shell.reservations.lastPath", activePath)
    }
  }, [activePath])

  useEffect(() => {
    window.localStorage.setItem("shell.context.date", dateIso)
  }, [dateIso])

  useEffect(() => {
    window.localStorage.setItem("shell.context.period", servicePeriod)
  }, [servicePeriod])

  useEffect(() => {
    setFormDirty(false)
  }, [action, editId, draft])

  const sidebarExpanded = isDesktop && (sidebarPinned || sidebarHover)

  const changePath = useCallback(
    (path: string, announcement: string) => {
      setParams((next) => {
        next.set("path", path)
        next.delete("detail")
        next.delete("action")
        next.delete("id")
        next.delete("draft")
      })
      announce(announcement)
    },
    [announce, setParams]
  )

  const switchPrimary = useCallback(
    (item: NavItem) => {
      const target = item.id === "reservations" ? lastReservationsPath : item.path
      changePath(target, `Navigated to ${item.label}`)
      setMenuOpen(false)
      setMoreOpen(false)
    },
    [changePath, lastReservationsPath]
  )

  const switchSubview = useCallback(
    (subviewPath: string, subviewLabel: string) => {
      changePath(subviewPath, `Showing ${subviewLabel} view`)
    },
    [changePath]
  )

  const openDetail = useCallback(() => {
    setParams((next) => {
      next.set("detail", sampleReservation.id)
      next.delete("action")
      next.delete("id")
    })
    announce(`Reservation detail panel opened for ${sampleReservation.guest}`)
  }, [announce, setParams])

  const closeDetail = useCallback(() => {
    setParams((next) => {
      next.delete("detail")
    })
  }, [setParams])

  const openAction = useCallback(
    (type: "new" | "edit", extra?: { id?: string; draft?: string }) => {
      setParams((next) => {
        next.set("action", type)
        if (extra?.id) next.set("id", extra.id)
        else next.delete("id")
        if (extra?.draft) next.set("draft", extra.draft)
        else next.delete("draft")
      })
      announce(type === "new" ? "New reservation form opened" : "Edit reservation form opened")
    },
    [announce, setParams]
  )

  const closeAction = useCallback(() => {
    if (formDirty) {
      const shouldClose = window.confirm("Discard unsaved changes?")
      if (!shouldClose) return
    }

    setParams((next) => {
      next.delete("action")
      next.delete("id")
      next.delete("draft")
    })
  }, [formDirty, setParams])

  const shiftDay = useCallback((offset: number) => {
    const d = new Date(`${dateIso}T00:00:00`)
    d.setDate(d.getDate() + offset)
    const nextIso = d.toISOString().slice(0, 10)
    setDateIso(nextIso)
  }, [dateIso])

  const goToday = useCallback(() => {
    setDateIso(currentContext.date)
  }, [])

  const runQuickAction = useCallback((id: QuickActionId) => {
    if (id === "new_reservation") openAction("new", { draft: "reservation" })
    if (id === "walk_in") openAction("new", { draft: "walk-in" })
    if (id === "waitlist") openAction("new", { draft: "waitlist" })
    if (id === "block_table") openAction("new", { draft: "block-table" })
    setQuickActionsOpen(false)
  }, [openAction])

  const todaySelected = dateIso === currentContext.date
  const selectedService = serviceOptions.find((p) => p.id === servicePeriod) ?? serviceOptions[1]

  const reservationTabs = (
    <Tabs value={activePath} onValueChange={(value) => {
      const target = reservationSubViews.find((view) => view.path === value)
      if (target) switchSubview(target.path, target.label)
    }} className="w-full">
      <TabsList
        className="h-auto w-full justify-start overflow-x-auto rounded-none bg-transparent p-0"
        role="tablist"
        aria-label="Reservation views"
      >
        {reservationSubViews.map((tab) => {
          const Icon = subviewIcons[tab.id]
          const selected = activePath === tab.path
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.path}
              className={cn(
                "h-9 shrink-0 rounded-none border-b-2 border-transparent px-3 text-xs transition-colors motion-reduce:transition-none",
                "data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                selected ? "border-emerald-500 text-emerald-400" : "text-zinc-400 hover:text-zinc-100"
              )}
            >
              <Icon className="mr-1.5 h-3.5 w-3.5" />
              {tab.label}
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )

  const quickActionTrigger = (
    <DropdownMenu open={quickActionsOpen} onOpenChange={setQuickActionsOpen}>
      <DropdownMenuTrigger asChild>
        <Button className="h-9 rounded-lg bg-emerald-600 text-emerald-50 hover:bg-emerald-500">
          <Plus className="mr-1.5 h-4 w-4" />
          New Reservation
          {!isMobile && <ChevronDown className="ml-1 h-3.5 w-3.5" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 border-zinc-800 bg-zinc-900 text-zinc-100">
        {quickActions.map((actionItem) => {
          const Icon = quickActionIcons[actionItem.id]
          return (
            <DropdownMenuItem
              key={actionItem.id}
              onClick={() => runQuickAction(actionItem.id)}
              className="text-zinc-100 focus:bg-zinc-800 focus:text-zinc-100"
            >
              <Icon className="mr-2 h-4 w-4 text-emerald-400" />
              {actionItem.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <a
        href="#shell-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-md focus:bg-zinc-100 focus:px-3 focus:py-2 focus:text-zinc-900"
      >
        Skip to main content
      </a>
      <div aria-live="polite" aria-atomic="true" className="sr-only">{liveMessage}</div>

      <div className="flex min-h-dvh">
        {isDesktop && (
          <TooltipProvider delayDuration={200}>
            <aside
              aria-label="Main navigation"
              aria-expanded={sidebarExpanded}
              onMouseEnter={() => setSidebarHover(true)}
              onMouseLeave={() => setSidebarHover(false)}
              className={cn(
                "sticky left-0 top-0 z-40 hidden h-dvh shrink-0 border-r border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl transition-[width] duration-200 motion-reduce:transition-none xl:flex",
                sidebarExpanded ? "w-[220px]" : "w-16"
              )}
            >
              <div className="flex w-full flex-col">
                <div className="flex h-16 items-center justify-between px-3">
                  <Button
                    variant="ghost"
                    className={cn("h-10 justify-start px-2", sidebarExpanded ? "w-auto" : "w-10")}
                    onClick={() => switchPrimary(navigationItems[0])}
                  >
                    <span className="text-lg">🍽</span>
                    {sidebarExpanded && <span className="ml-2 text-sm font-semibold">BerryTap</span>}
                  </Button>
                  {sidebarExpanded && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
                      onClick={() => setSidebarPinned((prev) => !prev)}
                      aria-label={sidebarPinned ? "Unpin sidebar" : "Pin sidebar"}
                    >
                      <PinIcon className={cn("h-4 w-4", sidebarPinned && "text-emerald-400")} />
                    </Button>
                  )}
                </div>

                <nav className="flex-1 px-2" aria-label="Main navigation">
                  {navigationItems.filter((i) => i.id !== "settings").map((item) => {
                    const Icon = primaryIcons[item.id]
                    const active = primary === item.id
                    const btn = (
                      <button
                        key={item.id}
                        onClick={() => switchPrimary(item)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "relative mb-1 flex h-10 w-full items-center rounded-lg px-2 text-left transition-colors",
                          "hover:bg-zinc-800/50",
                          active ? "bg-zinc-900 text-emerald-400" : "text-zinc-400"
                        )}
                      >
                        {active && <span className="absolute inset-y-1 left-0 w-1 rounded-full bg-emerald-500" aria-hidden="true" />}
                        <Icon className="h-4 w-4 shrink-0" />
                        {sidebarExpanded && <span className="ml-3 text-sm">{item.label}</span>}
                        {!sidebarExpanded && item.id === "messages" && item.badge ? (
                          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500" />
                        ) : null}
                        {sidebarExpanded && item.badge ? (
                          <Badge className="ml-auto bg-emerald-500/20 text-emerald-300">{item.badge}</Badge>
                        ) : null}
                      </button>
                    )

                    return sidebarExpanded ? btn : (
                      <Tooltip key={item.id}>
                        <TooltipTrigger asChild>{btn}</TooltipTrigger>
                        <TooltipContent side="right" className="border-zinc-800 bg-zinc-900 text-zinc-100">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </nav>

                <div className="border-t border-zinc-800/60 p-2">
                  {navigationItems.filter((i) => i.id === "settings").map((item) => {
                    const Icon = primaryIcons[item.id]
                    const active = primary === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => switchPrimary(item)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "mb-1 flex h-10 w-full items-center rounded-lg px-2 text-left transition-colors hover:bg-zinc-800/50",
                          active ? "bg-zinc-900 text-emerald-400" : "text-zinc-400"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {sidebarExpanded && <span className="ml-3 text-sm">Settings</span>}
                      </button>
                    )
                  })}
                  <button className="flex h-10 w-full items-center rounded-lg px-2 text-zinc-300 hover:bg-zinc-800/50">
                    <Avatar className="h-7 w-7 border border-zinc-700">
                      <AvatarFallback className="bg-zinc-800 text-xs">MA</AvatarFallback>
                    </Avatar>
                    {sidebarExpanded && <span className="ml-3 text-sm">{sampleUser.name}</span>}
                  </button>
                </div>
              </div>
            </aside>
          </TooltipProvider>
        )}

        <div className="relative flex min-h-dvh flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-30 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl">
            <div className="px-3 py-3 md:px-4 lg:px-6">
              {isMobile ? (
                <>
                  <div className="flex items-center justify-between">
                    <h1 className="text-base font-semibold">{navigationItems.find((i) => i.id === primary)?.label ?? "Reservations"}</h1>
                    <Button
                      size="icon"
                      className="h-9 w-9 rounded-full bg-emerald-600 text-emerald-50 hover:bg-emerald-500"
                      onClick={() => openAction("new", { draft: "reservation" })}
                      aria-label="New Reservation"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
                    <span>{formatDayLabel(dateIso)}</span>
                    <span>·</span>
                    <span>{selectedService.label}</span>
                    <div className="ml-auto flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => shiftDay(-1)}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      {!todaySelected && (
                        <Button size="sm" variant="outline" className="h-8 border-zinc-700 bg-zinc-900 text-xs" onClick={goToday}>
                          Today
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => shiftDay(1)}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    {isTablet && (
                      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setMenuOpen(true)}>
                          <Menu className="h-5 w-5" />
                        </Button>
                        <SheetContent side="left" className="w-[280px] border-zinc-800 bg-zinc-950 text-zinc-100 p-0">
                          <SheetHeader className="border-b border-zinc-800/60 px-4 py-4 text-left">
                            <SheetTitle className="text-zinc-100">🍽 BerryTap</SheetTitle>
                            <SheetDescription className="text-zinc-400">Restaurant navigation</SheetDescription>
                          </SheetHeader>
                          <div className="px-3 py-3">
                            {navigationItems.map((item) => {
                              const Icon = primaryIcons[item.id]
                              const active = primary === item.id
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => switchPrimary(item)}
                                  className={cn(
                                    "mb-1 flex h-11 w-full items-center rounded-lg px-3",
                                    active ? "bg-emerald-500/10 text-emerald-300" : "text-zinc-300 hover:bg-zinc-800/50"
                                  )}
                                >
                                  <Icon className="h-4 w-4" />
                                  <span className="ml-3 text-sm">{item.label}</span>
                                  {item.badge ? <Badge className="ml-auto bg-emerald-500/20 text-emerald-300">{item.badge}</Badge> : null}
                                </button>
                              )
                            })}
                            <Separator className="my-3 bg-zinc-800" />
                            <div className="text-xs text-zinc-400">
                              {sampleUser.name} · {sampleUser.role}
                              <div>{sampleUser.restaurant}</div>
                            </div>
                          </div>
                        </SheetContent>
                      </Sheet>
                    )}

                    <div>
                      <div className="text-sm font-semibold">
                        {navigationItems.find((i) => i.id === primary)?.label}
                        <span className="text-zinc-500"> · {formatDayLabel(dateIso)} · {selectedService.label}</span>
                      </div>
                      <div className="text-xs text-zinc-400">{selectedService.time}</div>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => shiftDay(-1)} aria-label="Previous day">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      {!todaySelected && (
                        <Button variant="outline" size="sm" className="h-8 border-zinc-700 bg-zinc-900 text-zinc-100" onClick={goToday}>
                          Today
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => shiftDay(1)} aria-label="Next day">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 border-zinc-700 bg-zinc-900 text-zinc-100">
                            {selectedService.label}
                            <ChevronDown className="ml-1 h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900 text-zinc-100">
                          {serviceOptions.map((period) => (
                            <DropdownMenuItem
                              key={period.id}
                              onClick={() => setServicePeriod(period.id)}
                              className="focus:bg-zinc-800"
                            >
                              {period.label} ({period.time})
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="3 unread messages">
                            <Bell className="h-4 w-4" />
                            <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-zinc-950">
                              3
                            </span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-72 border-zinc-800 bg-zinc-900 text-zinc-100">
                          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {[
                            "VIP guest arriving in 20 min",
                            "Table T12 requested split",
                            "Two unconfirmed reservations",
                            "Kitchen pacing warning",
                            "Waitlist reached 6 parties",
                          ].map((note) => (
                            <DropdownMenuItem key={note} className="whitespace-normal text-zinc-300 focus:bg-zinc-800">
                              {note}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => switchPrimary(navigationItems[3])} className="text-emerald-300 focus:bg-zinc-800">
                            View all →
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {quickActionTrigger}
                    </div>
                  </div>
                </>
              )}
            </div>

            {primary === "reservations" && !isMobile && (
              <div className="border-t border-zinc-800/60 px-3 md:px-4 lg:px-6">
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">{reservationTabs}</div>
                </div>
              </div>
            )}

            {primary === "reservations" && isMobile && (
              <div className="relative border-t border-zinc-800/60 px-3 py-2">
                <div className="overflow-x-auto">
                  <div className="flex min-w-max items-center gap-2">
                    {reservationSubViews.map((tab) => {
                      const selected = activePath === tab.path
                      return (
                        <button
                          key={tab.id}
                          onClick={() => switchSubview(tab.path, tab.label)}
                          className={cn(
                            "h-9 rounded-full px-3 text-xs",
                            selected ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"
                          )}
                        >
                          {tab.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-zinc-950 to-transparent" />
              </div>
            )}
          </header>

          <main id="shell-main" className="relative flex-1 overflow-hidden" role="tabpanel" aria-labelledby="active-tab">
            <ScrollArea className="h-full">
              <div className="mx-auto max-w-7xl p-4 md:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-100">{activePlaceholder.title}</h2>
                    <p className="text-sm text-zinc-400">{formatLongDate(dateIso)} · {selectedService.label}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
                    onClick={openDetail}
                  >
                    Open Detail Panel
                  </Button>
                </div>

                <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/60 p-6 backdrop-blur">
                  <div
                    className={cn(
                      "mb-4 h-40 rounded-xl border bg-gradient-to-br",
                      colorBlockMap[activePlaceholder.color] ?? colorBlockMap.zinc
                    )}
                  />
                  <p className="text-sm text-zinc-300">{activePlaceholder.description}</p>
                  <p className="mt-2 text-sm text-zinc-500">{activePlaceholder.title} content loads here.</p>
                </div>
              </div>
            </ScrollArea>
          </main>

          {isMobile && (
            <nav
              aria-label="Primary navigation"
              className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800/50 bg-zinc-950/90 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur-xl"
            >
              <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
                {MOBILE_NAV.map((item) => {
                  const active = item.path ? primary === getPrimaryFromPath(item.path) : false
                  const Icon = item.icon
                  const isMore = item.id === "more"
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (isMore) {
                          setMoreOpen(true)
                          return
                        }
                        const nav = navigationItems.find((n) => n.path === item.path)
                        if (nav) switchPrimary(nav)
                      }}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-11 flex-col items-center justify-center rounded-lg",
                        active ? "text-emerald-400" : "text-zinc-500"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="mt-1 text-[11px]">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </nav>
          )}
        </div>
      </div>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl border-zinc-800 bg-zinc-950 text-zinc-100">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-zinc-700" />
          <div className="space-y-1">
            {navigationItems.filter((item) => item.id === "tables" || item.id === "settings").map((item) => {
              const Icon = primaryIcons[item.id]
              return (
                <button
                  key={item.id}
                  onClick={() => switchPrimary(item)}
                  className="flex h-11 w-full items-center rounded-lg px-3 text-zinc-200 hover:bg-zinc-800"
                >
                  <Icon className="h-4 w-4" />
                  <span className="ml-3 text-sm">{item.label}</span>
                </button>
              )
            })}
          </div>
          <Separator className="my-4 bg-zinc-800" />
          <div className="text-sm text-zinc-400">
            <div>🏪 {sampleUser.restaurant}</div>
            <div>🧑 {sampleUser.name} · {sampleUser.role}</div>
            <button className="mt-2 text-rose-400">🚪 Sign Out</button>
          </div>
        </SheetContent>
      </Sheet>

      {isDetailOpen && isDesktop && (
        <>
          <button
            className="fixed inset-0 z-40 bg-black/30"
            aria-hidden="true"
            onClick={closeDetail}
          />
          <aside
            role="dialog"
            aria-label="Reservation detail panel"
            className="fixed inset-y-0 right-0 z-50 w-[420px] border-l border-zinc-800/70 bg-zinc-950/95 p-0 shadow-2xl backdrop-blur-xl transition-transform duration-300 motion-reduce:transition-none"
          >
            <ScrollArea className="h-full">
              <div className="p-5">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{sampleReservation.guest}</h3>
                    <p className="text-sm text-zinc-400">{sampleReservation.partySize} guests · {sampleReservation.time} · {sampleReservation.table}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={closeDetail}><X className="h-4 w-4" /></Button>
                </div>
                <div className="mb-4 flex gap-2">
                  <Button size="sm" variant="outline" className="border-zinc-700 bg-zinc-900" onClick={() => openAction("edit", { id: sampleReservation.id })}>
                    <Edit className="mr-1.5 h-3.5 w-3.5" />Edit
                  </Button>
                  <Button size="sm" variant="outline" className="border-rose-700/60 bg-rose-950/20 text-rose-300"><Trash2 className="mr-1.5 h-3.5 w-3.5" />Cancel</Button>
                  <Button size="sm" className="bg-emerald-600 text-emerald-50 hover:bg-emerald-500"><Check className="mr-1.5 h-3.5 w-3.5" />Seat</Button>
                </div>
                <Separator className="mb-4 bg-zinc-800" />
                <div className="space-y-3 text-sm">
                  <div><span className="text-zinc-500">Status:</span> <span className="text-emerald-400">Confirmed</span></div>
                  <div><span className="text-zinc-500">Zone:</span> {sampleReservation.zone}</div>
                  <div><span className="text-zinc-500">Server:</span> {sampleReservation.server}</div>
                  <div><span className="text-zinc-500">Phone:</span> {sampleReservation.phone}</div>
                  <div className="text-zinc-300">{sampleReservation.notes}</div>
                </div>
              </div>
            </ScrollArea>
          </aside>
        </>
      )}

      {isDetailOpen && isTablet && (
        <Sheet open={isDetailOpen} onOpenChange={(open) => !open && closeDetail()}>
          <SheetContent
            side="bottom"
            className={cn(
              "border-zinc-800 bg-zinc-950 text-zinc-100",
              detailSnap === "peek" ? "h-[30dvh]" : detailSnap === "half" ? "h-[50dvh]" : "h-[90dvh]"
            )}
          >
            <button className="mx-auto mb-3 block" onClick={() => setDetailSnap((s) => (s === "peek" ? "half" : s === "half" ? "full" : "peek"))}>
              <GripHorizontal className="h-5 w-5 text-zinc-500" />
            </button>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{sampleReservation.guest}</p>
                <p className="text-xs text-zinc-400">{sampleReservation.partySize} guests · {sampleReservation.time} · {sampleReservation.table}</p>
              </div>
              <Button size="sm" variant="outline" className="border-zinc-700 bg-zinc-900" onClick={() => openAction("edit", { id: sampleReservation.id })}>Edit</Button>
            </div>
            <ScrollArea className="h-[calc(100%-4rem)]">
              <p className="text-sm text-zinc-300">Detail content placeholder for {sampleReservation.id}.</p>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      )}

      {isDetailOpen && isMobile && (
        <div className="fixed inset-0 z-50 bg-zinc-950 transition-transform duration-300 motion-reduce:transition-none">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-3">
              <Button variant="ghost" size="sm" onClick={closeDetail}><ArrowLeft className="mr-1 h-4 w-4" />Back</Button>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="border-zinc-700 bg-zinc-900" onClick={() => openAction("edit", { id: sampleReservation.id })}>Edit</Button>
                <Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
              </div>
            </div>
            <ScrollArea className="flex-1 px-4 py-4">
              <h3 className="text-lg font-semibold">{sampleReservation.guest}</h3>
              <p className="text-sm text-zinc-400">{sampleReservation.partySize} guests · {sampleReservation.time}</p>
              <p className="mt-1 text-sm text-zinc-400">{sampleReservation.table} · {sampleReservation.zone}</p>
              <p className="mt-4 text-sm text-zinc-300">{sampleReservation.notes}</p>
            </ScrollArea>
            <div className="grid grid-cols-3 gap-2 border-t border-zinc-800 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
              <Button className="bg-emerald-600 text-emerald-50 hover:bg-emerald-500">Seat Now</Button>
              <Button variant="outline" className="border-rose-700/60 bg-rose-950/20 text-rose-300">Cancel</Button>
              <Button variant="outline" className="border-zinc-700 bg-zinc-900">No-Show</Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={isActionOpen && isDesktop} onOpenChange={(open) => !open && closeAction()}>
        <DialogContent className="max-w-[600px] border-zinc-800 bg-zinc-900 text-zinc-100">
          <DialogHeader>
            <DialogTitle>{action === "edit" ? "Edit Reservation" : "New Reservation"}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              {action === "edit" ? `Editing ${editId}` : `Draft: ${draft ?? "reservation"}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <input
              className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm"
              placeholder="Guest name"
              onChange={() => setFormDirty(true)}
            />
            <input
              className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm"
              placeholder="Party size"
              onChange={() => setFormDirty(true)}
            />
            <p className="text-sm text-zinc-400">Reservation form content loads here.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-zinc-700 bg-zinc-900" onClick={closeAction}>Cancel</Button>
            <Button className="bg-emerald-600 text-emerald-50 hover:bg-emerald-500" onClick={closeAction}>
              {action === "edit" ? "Save Changes" : "Create Reservation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={isActionOpen && isTablet} onOpenChange={(open) => !open && closeAction()}>
        <SheetContent side="bottom" className="h-[90dvh] border-zinc-800 bg-zinc-950 text-zinc-100">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-zinc-700" />
          <SheetHeader className="text-left">
            <SheetTitle>{action === "edit" ? "Edit Reservation" : "New Reservation"}</SheetTitle>
            <SheetDescription className="text-zinc-400">{action === "edit" ? editId : draft}</SheetDescription>
          </SheetHeader>
          <ScrollArea className="mt-4 h-[calc(90dvh-180px)]">
            <div className="space-y-3 pr-2">
              <input className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm" placeholder="Guest name" onChange={() => setFormDirty(true)} />
              <input className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm" placeholder="Party size" onChange={() => setFormDirty(true)} />
              <p className="text-sm text-zinc-400">Form content loads here.</p>
            </div>
          </ScrollArea>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" className="border-zinc-700 bg-zinc-900" onClick={closeAction}>Cancel</Button>
            <Button className="bg-emerald-600 text-emerald-50 hover:bg-emerald-500" onClick={closeAction}>{action === "edit" ? "Save" : "Create"}</Button>
          </div>
        </SheetContent>
      </Sheet>

      {isActionOpen && isMobile && (
        <div className="fixed inset-0 z-[60] bg-zinc-950 transition-transform duration-300 motion-reduce:transition-none">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-3">
              <Button variant="ghost" size="sm" onClick={closeAction}><ArrowLeft className="mr-1 h-4 w-4" />Cancel</Button>
              <span className="text-sm font-semibold">{action === "edit" ? "Edit Reservation" : "New Reservation"}</span>
              <span className="w-14" />
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                <input className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm" placeholder="Guest name" onChange={() => setFormDirty(true)} />
                <input className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm" placeholder="Party size" onChange={() => setFormDirty(true)} />
                <p className="text-sm text-zinc-400">Form content loads here.</p>
              </div>
            </ScrollArea>
            <div className="border-t border-zinc-800 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
              <Button className="h-11 w-full bg-emerald-600 text-emerald-50 hover:bg-emerald-500" onClick={closeAction}>
                {action === "edit" ? "Save Changes" : "Create Reservation"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ShellDemoPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-zinc-950" />}>
      <ShellDemoPageContent />
    </Suspense>
  )
}
