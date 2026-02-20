// ── Floor Plan Reservation Mode Data ─────────────────────────────────────────

import {
  type Reservation,
  type ReservationStatus,
  type GuestTag,
  type CourseStage,
  reservations as baseReservations,
  restaurantConfig,
  getCourseLabel,
  formatTime12h as fmtTime,
} from "./reservations-data"

// ── Types ────────────────────────────────────────────────────────────────────

export type HeatMapMode = "off" | "availability" | "server-load" | "revenue" | "turn-time"
export type ZoneId = "all" | "main" | "patio" | "private"

export type FloorTableStatus =
  | "empty"
  | "reserved"
  | "seated"
  | "arriving-soon"
  | "high-risk"
  | "completed"
  | "merged"

export interface FloorTable {
  id: string
  label: string
  seats: number
  zone: "main" | "patio" | "private"
  x: number // percentage
  y: number // percentage
  width: number // percentage width
  height: number // percentage height
  shape: "rect" | "round"
  mergedWith?: string
  areaLabel?: string // e.g. "Window", "Booth", "Corner"
}

export interface ServerSection {
  id: string
  name: string
  color: string // tailwind color
  colorHex: string
  tables: string[]
  activeTables: number
  load: "low" | "medium" | "high"
}

export interface TableRevenueData {
  tableId: string
  currentCheck: number
  predicted: number
}

export interface TableTurnData {
  tableId: string
  seatedDurationMin: number
  targetTurnMin: number
  status: "fast" | "on-target" | "slow"
}

export interface FloorTableState {
  table: FloorTable
  status: FloorTableStatus
  currentGuest?: string
  currentPartySize?: number
  currentCourse?: CourseStage
  currentCheckAmount?: number
  seatedAt?: string
  estClearTime?: string
  nextReservation?: {
    guestName: string
    partySize: number
    time: string
    tags: GuestTag[]
    visitCount?: number
    phone?: string
  }
  afterNext?: string // availability description
  turnsToday: number
  avgTurnTime: number
  todayHistory: { guest: string; partySize: number; time: string; check: number }[]
}

export interface UnassignedReservation {
  id: string
  guestName: string
  partySize: number
  time: string
  status: "confirmed" | "unconfirmed"
  risk: "low" | "medium" | "high"
  riskScore?: number
  tags: GuestTag[]
  needsTableType: string
}

// ── Table Layout ─────────────────────────────────────────────────────────────

export const floorTables: FloorTable[] = [
  // Main Dining
  { id: "T1",  label: "T1",  seats: 2, zone: "main", x: 10, y: 15, width: 7, height: 9, shape: "rect", areaLabel: "Window" },
  { id: "T3",  label: "T3",  seats: 2, zone: "main", x: 25, y: 15, width: 7, height: 9, shape: "rect", areaLabel: "Window" },
  { id: "T4",  label: "T4",  seats: 2, zone: "main", x: 10, y: 35, width: 7, height: 9, shape: "rect" },
  { id: "T5",  label: "T5",  seats: 2, zone: "main", x: 25, y: 35, width: 7, height: 9, shape: "rect" },
  { id: "T7",  label: "T7",  seats: 4, zone: "main", x: 50, y: 15, width: 10, height: 9, shape: "rect", areaLabel: "Center" },
  { id: "T8",  label: "T8",  seats: 4, zone: "main", x: 40, y: 35, width: 10, height: 9, shape: "rect", mergedWith: "T9" },
  { id: "T9",  label: "T9",  seats: 4, zone: "main", x: 55, y: 35, width: 10, height: 9, shape: "rect", mergedWith: "T8" },
  { id: "T10", label: "T10", seats: 4, zone: "main", x: 10, y: 55, width: 10, height: 9, shape: "rect" },
  { id: "T12", label: "T12", seats: 4, zone: "main", x: 30, y: 55, width: 10, height: 9, shape: "rect", areaLabel: "Window" },
  { id: "T14", label: "T14", seats: 4, zone: "main", x: 50, y: 55, width: 10, height: 9, shape: "rect" },
  { id: "T15", label: "T15", seats: 4, zone: "main", x: 10, y: 75, width: 10, height: 9, shape: "rect" },
  { id: "T16", label: "T16", seats: 4, zone: "main", x: 30, y: 75, width: 7,  height: 9, shape: "rect" },
  { id: "T17", label: "T17", seats: 6, zone: "main", x: 50, y: 75, width: 12, height: 9, shape: "rect", areaLabel: "Booth" },

  // Patio
  { id: "T18", label: "T18", seats: 2, zone: "patio", x: 10, y: 92, width: 7,  height: 7, shape: "round" },
  { id: "T19", label: "T19", seats: 4, zone: "patio", x: 25, y: 92, width: 10, height: 7, shape: "round" },
  { id: "T20", label: "T20", seats: 4, zone: "patio", x: 42, y: 92, width: 10, height: 7, shape: "round" },
  { id: "T21", label: "T21", seats: 2, zone: "patio", x: 58, y: 92, width: 7,  height: 7, shape: "round" },
  { id: "T22", label: "T22", seats: 6, zone: "patio", x: 72, y: 92, width: 10, height: 7, shape: "round" },

  // Private Room
  { id: "T23", label: "T23", seats: 6, zone: "private", x: 82, y: 25, width: 10, height: 9, shape: "rect", mergedWith: "T24" },
  { id: "T24", label: "T24", seats: 4, zone: "private", x: 82, y: 45, width: 10, height: 9, shape: "rect", mergedWith: "T23" },
  { id: "T25", label: "T25", seats: 4, zone: "private", x: 82, y: 65, width: 10, height: 9, shape: "rect" },
]

// ── Server Sections ──────────────────────────────────────────────────────────

export const serverSections: ServerSection[] = [
  { id: "anna",   name: "Anna",   color: "purple", colorHex: "#a855f7", tables: ["T1", "T3", "T4", "T5", "T7"],   activeTables: 4, load: "high"   },
  { id: "mike",   name: "Mike",   color: "teal",   colorHex: "#14b8a6", tables: ["T8", "T9", "T10", "T12"],       activeTables: 3, load: "medium" },
  { id: "lisa",   name: "Lisa",   color: "amber",  colorHex: "#f59e0b", tables: ["T14", "T15", "T16", "T17"],     activeTables: 2, load: "low"    },
  { id: "carlos", name: "Carlos", color: "cyan",    colorHex: "#06b6d4", tables: ["T18", "T19", "T20", "T21", "T22"], activeTables: 2, load: "low" },
  { id: "jordan", name: "Jordan", color: "pink",    colorHex: "#ec4899", tables: ["T23", "T24", "T25"],            activeTables: 1, load: "low"    },
]

// ── Revenue Mock Data ────────────────────────────────────────────────────────

export const revenueData: TableRevenueData[] = [
  { tableId: "T1",  currentCheck: 145, predicted: 180 },
  { tableId: "T3",  currentCheck: 78,  predicted: 120 },
  { tableId: "T4",  currentCheck: 89,  predicted: 89 },
  { tableId: "T5",  currentCheck: 34,  predicted: 95 },
  { tableId: "T7",  currentCheck: 156, predicted: 200 },
  { tableId: "T8",  currentCheck: 210, predicted: 280 },
  { tableId: "T9",  currentCheck: 0,   predicted: 0 },
  { tableId: "T10", currentCheck: 0,   predicted: 0 },
  { tableId: "T12", currentCheck: 186, predicted: 220 },
  { tableId: "T14", currentCheck: 0,   predicted: 0 },
  { tableId: "T15", currentCheck: 0,   predicted: 0 },
  { tableId: "T16", currentCheck: 168, predicted: 200 },
  { tableId: "T17", currentCheck: 0,   predicted: 0 },
  { tableId: "T18", currentCheck: 0,   predicted: 60 },
  { tableId: "T19", currentCheck: 45,  predicted: 120 },
  { tableId: "T20", currentCheck: 0,   predicted: 100 },
  { tableId: "T21", currentCheck: 0,   predicted: 0 },
  { tableId: "T22", currentCheck: 234, predicted: 234 },
  { tableId: "T23", currentCheck: 0,   predicted: 320 },
  { tableId: "T24", currentCheck: 0,   predicted: 0 },
  { tableId: "T25", currentCheck: 145, predicted: 180 },
]

// ── Turn Time Data ───────────────────────────────────────────────────────────

export const turnTimeData: TableTurnData[] = [
  { tableId: "T1",  seatedDurationMin: 83,  targetTurnMin: 75, status: "slow" },
  { tableId: "T3",  seatedDurationMin: 53,  targetTurnMin: 75, status: "fast" },
  { tableId: "T4",  seatedDurationMin: 0,   targetTurnMin: 75, status: "on-target" },
  { tableId: "T5",  seatedDurationMin: 23,  targetTurnMin: 75, status: "fast" },
  { tableId: "T7",  seatedDurationMin: 53,  targetTurnMin: 80, status: "fast" },
  { tableId: "T8",  seatedDurationMin: 83,  targetTurnMin: 90, status: "on-target" },
  { tableId: "T9",  seatedDurationMin: 0,   targetTurnMin: 80, status: "on-target" },
  { tableId: "T10", seatedDurationMin: 0,   targetTurnMin: 80, status: "on-target" },
  { tableId: "T12", seatedDurationMin: 83,  targetTurnMin: 80, status: "slow" },
  { tableId: "T14", seatedDurationMin: 0,   targetTurnMin: 80, status: "on-target" },
  { tableId: "T15", seatedDurationMin: 0,   targetTurnMin: 80, status: "on-target" },
  { tableId: "T16", seatedDurationMin: 53,  targetTurnMin: 80, status: "fast" },
  { tableId: "T17", seatedDurationMin: 0,   targetTurnMin: 90, status: "on-target" },
  { tableId: "T18", seatedDurationMin: 5,   targetTurnMin: 60, status: "fast" },
  { tableId: "T19", seatedDurationMin: 23,  targetTurnMin: 70, status: "fast" },
  { tableId: "T20", seatedDurationMin: 33,  targetTurnMin: 70, status: "on-target" },
  { tableId: "T21", seatedDurationMin: 0,   targetTurnMin: 60, status: "on-target" },
  { tableId: "T22", seatedDurationMin: 0,   targetTurnMin: 90, status: "on-target" },
  { tableId: "T23", seatedDurationMin: 0,   targetTurnMin: 100, status: "on-target" },
  { tableId: "T24", seatedDurationMin: 0,   targetTurnMin: 80, status: "on-target" },
  { tableId: "T25", seatedDurationMin: 53,  targetTurnMin: 80, status: "fast" },
]

// ── Unassigned Reservations ──────────────────────────────────────────────────

export const unassignedReservations: UnassignedReservation[] = [
  {
    id: "u1",
    guestName: "Morrison",
    partySize: 4,
    time: "19:45",
    status: "unconfirmed",
    risk: "high",
    riskScore: 68,
    tags: [],
    needsTableType: "Needs 4-top",
  },
  {
    id: "u2",
    guestName: "Tanaka",
    partySize: 2,
    time: "20:00",
    status: "confirmed",
    risk: "low",
    tags: [],
    needsTableType: "Needs 2-top",
  },
  {
    id: "u3",
    guestName: "Smith Group",
    partySize: 8,
    time: "20:30",
    status: "confirmed",
    risk: "low",
    tags: [{ type: "high-value", label: "High value" }],
    needsTableType: "Needs merge",
  },
]

// ── Table State at "NOW" (7:23 PM, Jan 17) ──────────────────────────────────

export function getFloorTableStates(scrubTime?: string): FloorTableState[] {
  const now = scrubTime ?? "19:23"
  const [nowH, nowM] = now.split(":").map(Number)
  const nowMin = nowH * 60 + nowM

  const states: FloorTableState[] = floorTables.map((table) => {
    const state = tableStatesAt1923.find((s) => s.tableId === table.id)
    if (!state) {
      return {
        table,
        status: "empty" as FloorTableStatus,
        turnsToday: 0,
        avgTurnTime: 0,
        todayHistory: [],
      }
    }
    return {
      table,
      status: state.status,
      currentGuest: state.currentGuest,
      currentPartySize: state.currentPartySize,
      currentCourse: state.currentCourse,
      currentCheckAmount: state.currentCheckAmount,
      seatedAt: state.seatedAt,
      estClearTime: state.estClearTime,
      nextReservation: state.nextReservation,
      afterNext: state.afterNext,
      turnsToday: state.turnsToday,
      avgTurnTime: state.avgTurnTime,
      todayHistory: state.todayHistory,
    }
  })

  return states
}

// Raw state data for each table at 7:23 PM
const tableStatesAt1923: {
  tableId: string
  status: FloorTableStatus
  currentGuest?: string
  currentPartySize?: number
  currentCourse?: CourseStage
  currentCheckAmount?: number
  seatedAt?: string
  estClearTime?: string
  nextReservation?: FloorTableState["nextReservation"]
  afterNext?: string
  turnsToday: number
  avgTurnTime: number
  todayHistory: { guest: string; partySize: number; time: string; check: number }[]
}[] = [
  {
    tableId: "T1",
    status: "seated",
    currentGuest: "Williams",
    currentPartySize: 2,
    currentCourse: "mains-served",
    currentCheckAmount: 145,
    seatedAt: "18:00",
    estClearTime: "19:45",
    nextReservation: undefined,
    afterNext: "Open until 21:00",
    turnsToday: 1,
    avgTurnTime: 82,
    todayHistory: [{ guest: "Hart", partySize: 2, time: "17:30-18:00", check: 0 }],
  },
  {
    tableId: "T3",
    status: "seated",
    currentGuest: "Jensen",
    currentPartySize: 2,
    currentCourse: "dessert",
    currentCheckAmount: 78,
    seatedAt: "18:30",
    estClearTime: "19:40",
    nextReservation: { guestName: "Sofia Reyes", partySize: 2, time: "20:00", tags: [{ type: "window", label: "Window seat" }], visitCount: 6, phone: "+1 (555) 456-7890" },
    afterNext: "Open after 21:30",
    turnsToday: 2,
    avgTurnTime: 68,
    todayHistory: [
      { guest: "Sharma", partySize: 2, time: "17:30-18:15", check: 94 },
      { guest: "Jensen", partySize: 2, time: "18:30-now", check: 78 },
    ],
  },
  {
    tableId: "T4",
    status: "completed",
    currentGuest: undefined,
    turnsToday: 1,
    avgTurnTime: 75,
    estClearTime: "19:20",
    nextReservation: { guestName: "Isla McAllister", partySize: 2, time: "20:15", tags: [{ type: "first-timer", label: "First timer" }], phone: "+1 (555) 678-9012" },
    afterNext: "Open after 22:00",
    todayHistory: [{ guest: "Thompson", partySize: 2, time: "17:30-19:15", check: 89 }],
  },
  {
    tableId: "T5",
    status: "arriving-soon",
    currentGuest: "Webb",
    currentPartySize: 2,
    currentCourse: "appetizers",
    currentCheckAmount: 34,
    seatedAt: "19:00",
    estClearTime: "20:30",
    nextReservation: { guestName: "Marcus Webb", partySize: 2, time: "19:30", tags: [{ type: "first-timer", label: "First timer" }], phone: "+1 (555) 876-5432" },
    afterNext: undefined,
    turnsToday: 2,
    avgTurnTime: 70,
    todayHistory: [
      { guest: "Kim", partySize: 3, time: "17:30-18:45", check: 112 },
      { guest: "Webb", partySize: 2, time: "19:00-now", check: 34 },
    ],
  },
  {
    tableId: "T7",
    status: "seated",
    currentGuest: "Kim Family",
    currentPartySize: 4,
    currentCourse: "mains-fired",
    currentCheckAmount: 156,
    seatedAt: "18:30",
    estClearTime: "20:15",
    nextReservation: undefined,
    afterNext: "Open after 20:15",
    turnsToday: 1,
    avgTurnTime: 90,
    todayHistory: [{ guest: "Kim Family", partySize: 4, time: "18:30-now", check: 156 }],
  },
  {
    tableId: "T8",
    status: "seated",
    currentGuest: "O'Brien Birthday",
    currentPartySize: 6,
    currentCourse: "appetizers",
    currentCheckAmount: 210,
    seatedAt: "19:00",
    estClearTime: "21:15",
    turnsToday: 1,
    avgTurnTime: 0,
    todayHistory: [{ guest: "O'Brien", partySize: 6, time: "19:00-now", check: 210 }],
  },
  {
    tableId: "T9",
    status: "merged",
    turnsToday: 0,
    avgTurnTime: 0,
    todayHistory: [],
  },
  {
    tableId: "T10",
    status: "empty",
    turnsToday: 0,
    avgTurnTime: 0,
    afterNext: "Available now",
    todayHistory: [],
  },
  {
    tableId: "T12",
    status: "seated",
    currentGuest: "Patel",
    currentPartySize: 4,
    currentCourse: "paying",
    currentCheckAmount: 186,
    seatedAt: "18:00",
    estClearTime: "19:35",
    nextReservation: { guestName: "Sarah Chen", partySize: 4, time: "19:30", tags: [{ type: "vip", label: "VIP" }, { type: "allergy", label: "Allergy", detail: "Shellfish" }], visitCount: 12, phone: "+1 (555) 234-5678" },
    afterNext: "Open after 21:30",
    turnsToday: 1,
    avgTurnTime: 95,
    todayHistory: [{ guest: "Patel", partySize: 4, time: "18:00-now", check: 186 }],
  },
  {
    tableId: "T14",
    status: "high-risk",
    currentGuest: undefined,
    turnsToday: 0,
    avgTurnTime: 0,
    nextReservation: { guestName: "Jake Morrison", partySize: 4, time: "19:45", tags: [], phone: "+1 (555) 987-6543" },
    afterNext: undefined,
    todayHistory: [],
  },
  {
    tableId: "T15",
    status: "empty",
    turnsToday: 0,
    avgTurnTime: 0,
    afterNext: "Available now",
    todayHistory: [],
  },
  {
    tableId: "T16",
    status: "seated",
    currentGuest: "Nguyen",
    currentPartySize: 4,
    currentCourse: "mains-served",
    currentCheckAmount: 168,
    seatedAt: "18:30",
    estClearTime: "20:00",
    nextReservation: { guestName: "Chen Wei Group", partySize: 8, time: "20:00", tags: [{ type: "high-value", label: "High value" }], visitCount: 2, phone: "+1 (555) 567-8901" },
    afterNext: undefined,
    turnsToday: 1,
    avgTurnTime: 85,
    todayHistory: [{ guest: "Nguyen", partySize: 4, time: "18:30-now", check: 168 }],
  },
  {
    tableId: "T17",
    status: "empty",
    turnsToday: 0,
    avgTurnTime: 0,
    afterNext: "Available now",
    todayHistory: [],
  },
  {
    tableId: "T18",
    status: "seated",
    currentGuest: "Garcia",
    currentPartySize: 2,
    currentCourse: "ordering",
    currentCheckAmount: 0,
    seatedAt: "19:18",
    estClearTime: "20:30",
    turnsToday: 0,
    avgTurnTime: 0,
    todayHistory: [{ guest: "Garcia", partySize: 2, time: "19:18-now", check: 0 }],
  },
  {
    tableId: "T19",
    status: "seated",
    currentGuest: "Johansson",
    currentPartySize: 4,
    currentCourse: "ordering",
    currentCheckAmount: 45,
    seatedAt: "19:00",
    estClearTime: "21:00",
    turnsToday: 0,
    avgTurnTime: 0,
    todayHistory: [{ guest: "Johansson", partySize: 4, time: "19:00-now", check: 45 }],
  },
  {
    tableId: "T20",
    status: "reserved",
    currentGuest: undefined,
    turnsToday: 1,
    avgTurnTime: 80,
    nextReservation: { guestName: "Muller", partySize: 4, time: "19:45", tags: [] },
    afterNext: "Open after 21:45",
    todayHistory: [{ guest: "Simmons", partySize: 4, time: "17:30-19:15", check: 134 }],
  },
  {
    tableId: "T21",
    status: "empty",
    turnsToday: 0,
    avgTurnTime: 0,
    afterNext: "Available now",
    todayHistory: [],
  },
  {
    tableId: "T22",
    status: "completed",
    turnsToday: 1,
    avgTurnTime: 120,
    estClearTime: "19:30",
    nextReservation: { guestName: "Rivera", partySize: 5, time: "21:00", tags: [{ type: "anniversary", label: "Anniversary" }] },
    afterNext: undefined,
    todayHistory: [{ guest: "Anderson Party", partySize: 6, time: "17:30-19:30", check: 234 }],
  },
  {
    tableId: "T23",
    status: "reserved",
    currentGuest: undefined,
    turnsToday: 0,
    avgTurnTime: 0,
    nextReservation: { guestName: "Corporate Dinner", partySize: 8, time: "20:00", tags: [{ type: "high-value", label: "High value" }] },
    afterNext: undefined,
    todayHistory: [],
  },
  {
    tableId: "T24",
    status: "merged",
    turnsToday: 0,
    avgTurnTime: 0,
    todayHistory: [],
  },
  {
    tableId: "T25",
    status: "seated",
    currentGuest: "Lee",
    currentPartySize: 3,
    currentCourse: "mains-served",
    currentCheckAmount: 145,
    seatedAt: "18:30",
    estClearTime: "20:15",
    turnsToday: 0,
    avgTurnTime: 0,
    todayHistory: [{ guest: "Lee", partySize: 3, time: "18:30-now", check: 145 }],
  },
]

// ── Time Scrubber Helpers ────────────────────────────────────────────────────

export const DINNER_START_MIN = 17 * 60 // 5:00 PM
export const DINNER_END_MIN = 23 * 60   // 11:00 PM
export const NOW_MIN = 19 * 60 + 23     // 7:23 PM

export function minutesToTime(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
}

export function minutesToTime12h(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  const ampm = h >= 12 ? "PM" : "AM"
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`
}

export function getServerForTable(tableId: string): ServerSection | undefined {
  return serverSections.find((s) => s.tables.includes(tableId))
}

export function getRevenueForTable(tableId: string): TableRevenueData | undefined {
  return revenueData.find((r) => r.tableId === tableId)
}

export function getTurnTimeForTable(tableId: string): TableTurnData | undefined {
  return turnTimeData.find((t) => t.tableId === tableId)
}

// ── Heat Map Color Helpers ───────────────────────────────────────────────────

export function getAvailabilityColor(status: FloorTableStatus): { border: string; bg: string; glow: string } {
  switch (status) {
    case "empty":         return { border: "border-emerald-500", bg: "bg-emerald-500/15", glow: "shadow-[0_0_16px_rgba(16,185,129,0.4)]" }
    case "completed":     return { border: "border-amber-500",   bg: "bg-amber-500/10",   glow: "shadow-[0_0_12px_rgba(245,158,11,0.3)]" }
    case "reserved":      return { border: "border-blue-500",    bg: "bg-blue-500/10",    glow: "shadow-[0_0_12px_rgba(59,130,246,0.3)]" }
    case "arriving-soon": return { border: "border-amber-500",   bg: "bg-amber-500/10",   glow: "shadow-[0_0_14px_rgba(245,158,11,0.35)]" }
    case "seated":        return { border: "border-zinc-600",    bg: "bg-zinc-800/40",    glow: "" }
    case "high-risk":     return { border: "border-rose-500",    bg: "bg-rose-500/10",    glow: "shadow-[0_0_14px_rgba(244,63,94,0.35)]" }
    case "merged":        return { border: "border-zinc-700",    bg: "bg-zinc-800/20",    glow: "" }
  }
}

export function getRevenueHeatColor(check: number): string {
  if (check === 0) return "bg-zinc-800/30"
  if (check < 50) return "bg-emerald-900/30"
  if (check < 100) return "bg-emerald-700/30"
  if (check < 150) return "bg-emerald-600/35"
  if (check < 200) return "bg-emerald-500/40"
  if (check < 300) return "bg-emerald-400/45"
  return "bg-emerald-300/50"
}

export function getTurnTimeHeatColor(data: TableTurnData | undefined): string {
  if (!data || data.seatedDurationMin === 0) return "bg-zinc-800/30"
  if (data.status === "fast") return "bg-emerald-500/30"
  if (data.status === "on-target") return "bg-amber-500/25"
  return "bg-rose-500/30"
}

// ── Default Exports ──────────────────────────────────────────────────────────

export { restaurantConfig, fmtTime as formatTime12h, getCourseLabel }
