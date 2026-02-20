// ── Timeline View ("The River") Data ─────────────────────────────────────────

import { type CapacitySlot, capacitySlots, restaurantConfig } from "./reservations-data"

export type TimelineStatus =
  | "confirmed"
  | "seated"
  | "completed"
  | "no-show"
  | "late"
  | "arriving"
  | "unconfirmed"

export type CourseProgress =
  | "ordering"
  | "apps"
  | "mains-fired"
  | "mains-served"
  | "dessert"
  | "check"
  | "paying"

export interface TimelineTag {
  type: "vip" | "allergy" | "birthday" | "anniversary" | "first-timer" | "note"
  label: string
  icon: string
  detail?: string
}

export interface TimelineBlock {
  id: string
  guestName: string
  partySize: number
  table: string
  mergedWith?: string          // e.g. "T9" if this block also uses T9
  startTime: string            // "HH:MM"
  endTime: string              // "HH:MM"
  status: TimelineStatus
  risk: "low" | "medium" | "high"
  riskScore?: number
  courseProgress?: CourseProgress
  tags: TimelineTag[]
  notes?: string
}

export interface GhostBlock {
  id: string
  table: string
  predictedTime: string        // "HH:MM" - when it becomes available
  endTime: string
  label: string
  conditional?: string         // e.g. "IF Morrison shows"
}

export interface MergedBlock {
  table: string
  mergedWith: string           // the primary table
  startTime: string
  endTime: string
}

export interface TableLane {
  id: string
  label: string                // e.g. "T1"
  seats: number
  zone: "main" | "patio" | "private"
}

// ── Table Definitions ────────────────────────────────────────────────────────

export const tableLanes: TableLane[] = [
  // Main Dining
  { id: "T1",  label: "T1",  seats: 2, zone: "main" },
  { id: "T3",  label: "T3",  seats: 2, zone: "main" },
  { id: "T4",  label: "T4",  seats: 2, zone: "main" },
  { id: "T5",  label: "T5",  seats: 2, zone: "main" },
  { id: "T7",  label: "T7",  seats: 4, zone: "main" },
  { id: "T8",  label: "T8",  seats: 4, zone: "main" },
  { id: "T9",  label: "T9",  seats: 4, zone: "main" },
  { id: "T12", label: "T12", seats: 4, zone: "main" },
  { id: "T14", label: "T14", seats: 4, zone: "main" },
  { id: "T16", label: "T16", seats: 4, zone: "main" },
  // Patio
  { id: "T18", label: "T18", seats: 2, zone: "patio" },
  { id: "T19", label: "T19", seats: 4, zone: "patio" },
  { id: "T20", label: "T20", seats: 4, zone: "patio" },
  { id: "T21", label: "T21", seats: 2, zone: "patio" },
  { id: "T22", label: "T22", seats: 6, zone: "patio" },
  // Private Room
  { id: "T23", label: "T23", seats: 6, zone: "private" },
  { id: "T24", label: "T24", seats: 4, zone: "private" },
  { id: "T25", label: "T25", seats: 4, zone: "private" },
]

export const zones = [
  { id: "main" as const,    name: "Main Dining" },
  { id: "patio" as const,   name: "Patio" },
  { id: "private" as const, name: "Private Room" },
]

// ── Time Axis Config ─────────────────────────────────────────────────────────

export const DINNER_START = "17:00"
export const DINNER_END   = "23:00"
export const NOW_TIME     = "19:23"
export const NOW_LABEL    = "7:23 PM"

export type ZoomLevel = "1hr" | "30min" | "15min"

/** Returns the number of total columns for the dinner range at a given zoom */
export function getColumnCount(zoom: ZoomLevel): number {
  const totalMinutes = 360 // 17:00 to 23:00 = 6 hours
  const slotMinutes = zoom === "1hr" ? 60 : zoom === "30min" ? 30 : 15
  return totalMinutes / slotMinutes
}

/** Returns the width in pixels for a single column slot at a given zoom */
export function getSlotWidth(zoom: ZoomLevel): number {
  return zoom === "1hr" ? 120 : zoom === "30min" ? 100 : 80
}

/** Converts "HH:MM" to minutes from DINNER_START (17:00) */
export function timeToOffset(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return (h - 17) * 60 + m
}

/** Converts offset minutes from DINNER_START to pixel position */
export function offsetToPixel(offset: number, zoom: ZoomLevel): number {
  const slotMinutes = zoom === "1hr" ? 60 : zoom === "30min" ? 30 : 15
  const slotWidth = getSlotWidth(zoom)
  return (offset / slotMinutes) * slotWidth
}

/** Returns time label strings for the axis */
export function getTimeLabels(zoom: ZoomLevel): string[] {
  const labels: string[] = []
  const slotMinutes = zoom === "1hr" ? 60 : zoom === "30min" ? 30 : 15
  for (let minutes = 0; minutes < 360; minutes += slotMinutes) {
    const h = 17 + Math.floor(minutes / 60)
    const m = minutes % 60
    const h12 = h > 12 ? h - 12 : h
    labels.push(`${h12}:${m.toString().padStart(2, "0")}`)
  }
  return labels
}

/** Returns the NOW position in pixels */
export function getNowPixel(zoom: ZoomLevel): number {
  return offsetToPixel(timeToOffset(NOW_TIME), zoom)
}

/** Returns capacity data aligned to timeline slots */
export function getTimelineCapacity(): CapacitySlot[] {
  return capacitySlots
}

// ── Mock Timeline Blocks ─────────────────────────────────────────────────────

export const timelineBlocks: TimelineBlock[] = [
  // Completed
  {
    id: "tb1",
    guestName: "Thompson",
    partySize: 2,
    table: "T4",
    startTime: "17:30",
    endTime: "19:15",
    status: "completed",
    risk: "low",
    tags: [],
  },
  {
    id: "tb2",
    guestName: "Anderson Party",
    partySize: 6,
    table: "T22",
    startTime: "17:30",
    endTime: "19:30",
    status: "completed",
    risk: "low",
    tags: [],
  },

  // Seated
  {
    id: "tb3",
    guestName: "Williams",
    partySize: 2,
    table: "T1",
    startTime: "18:00",
    endTime: "20:00",
    status: "seated",
    risk: "low",
    courseProgress: "mains-served",
    tags: [],
  },
  {
    id: "tb4",
    guestName: "Patel",
    partySize: 4,
    table: "T12",
    startTime: "18:00",
    endTime: "19:45",
    status: "seated",
    risk: "low",
    courseProgress: "check",
    tags: [],
  },
  {
    id: "tb5",
    guestName: "Jensen",
    partySize: 2,
    table: "T3",
    startTime: "18:30",
    endTime: "20:15",
    status: "seated",
    risk: "low",
    courseProgress: "dessert",
    tags: [],
  },
  {
    id: "tb6",
    guestName: "Kim Family",
    partySize: 4,
    table: "T7",
    startTime: "18:30",
    endTime: "20:15",
    status: "seated",
    risk: "low",
    courseProgress: "mains-fired",
    tags: [],
  },
  {
    id: "tb7",
    guestName: "Nguyen",
    partySize: 4,
    table: "T16",
    startTime: "18:30",
    endTime: "20:30",
    status: "seated",
    risk: "low",
    courseProgress: "mains-served",
    tags: [],
  },
  {
    id: "tb8",
    guestName: "Lee",
    partySize: 3,
    table: "T25",
    startTime: "18:30",
    endTime: "20:15",
    status: "seated",
    risk: "low",
    courseProgress: "mains-served",
    tags: [],
  },
  {
    id: "tb9",
    guestName: "O'Brien",
    partySize: 6,
    table: "T8",
    mergedWith: "T9",
    startTime: "19:00",
    endTime: "21:15",
    status: "seated",
    risk: "low",
    courseProgress: "apps",
    tags: [
      { type: "birthday", label: "Birthday", icon: "cake" },
      { type: "note", label: "Cake at 8pm", icon: "note", detail: "Cake at 8pm" },
    ],
    notes: "Cake at 8pm",
  },
  {
    id: "tb10",
    guestName: "Webb",
    partySize: 2,
    table: "T5",
    startTime: "19:00",
    endTime: "20:45",
    status: "seated",
    risk: "medium",
    courseProgress: "apps",
    tags: [
      { type: "first-timer", label: "First-timer", icon: "star" },
    ],
  },
  {
    id: "tb11",
    guestName: "Johansson",
    partySize: 4,
    table: "T19",
    startTime: "19:00",
    endTime: "21:00",
    status: "seated",
    risk: "low",
    courseProgress: "ordering",
    tags: [],
  },

  // Arriving / Confirmed
  {
    id: "tb12",
    guestName: "Chen",
    partySize: 4,
    table: "T12",
    startTime: "19:30",
    endTime: "21:30",
    status: "arriving",
    risk: "low",
    tags: [
      { type: "vip", label: "VIP", icon: "star" },
      { type: "allergy", label: "Shellfish allergy", icon: "shrimp", detail: "Shellfish" },
    ],
  },
  {
    id: "tb13",
    guestName: "Morrison",
    partySize: 4,
    table: "T14",
    startTime: "19:30",
    endTime: "21:30",
    status: "unconfirmed",
    risk: "high",
    riskScore: 68,
    tags: [],
  },
  {
    id: "tb14",
    guestName: "Muller",
    partySize: 4,
    table: "T20",
    startTime: "19:45",
    endTime: "21:45",
    status: "confirmed",
    risk: "low",
    tags: [],
  },
  {
    id: "tb15",
    guestName: "Corporate Dinner",
    partySize: 8,
    table: "T23",
    mergedWith: "T24",
    startTime: "20:00",
    endTime: "22:30",
    status: "confirmed",
    risk: "low",
    tags: [
      { type: "note", label: "Pre-order wine", icon: "note" },
    ],
    notes: "Pre-order wine, merged tables",
  },
  {
    id: "tb16",
    guestName: "Dubois",
    partySize: 2,
    table: "T18",
    startTime: "20:00",
    endTime: "21:30",
    status: "confirmed",
    risk: "low",
    tags: [],
  },
  {
    id: "tb17",
    guestName: "Ali",
    partySize: 2,
    table: "T4",
    startTime: "20:15",
    endTime: "22:00",
    status: "confirmed",
    risk: "low",
    tags: [],
  },
  {
    id: "tb18",
    guestName: "Garcia",
    partySize: 4,
    table: "T7",
    startTime: "20:30",
    endTime: "22:15",
    status: "confirmed",
    risk: "low",
    tags: [],
  },
  {
    id: "tb19",
    guestName: "Santos",
    partySize: 4,
    table: "T25",
    startTime: "20:30",
    endTime: "22:30",
    status: "unconfirmed",
    risk: "medium",
    tags: [],
  },
  {
    id: "tb20",
    guestName: "Park",
    partySize: 2,
    table: "T3",
    startTime: "21:00",
    endTime: "22:30",
    status: "confirmed",
    risk: "low",
    tags: [],
  },
  {
    id: "tb21",
    guestName: "Nakamura",
    partySize: 3,
    table: "T9",
    startTime: "21:00",
    endTime: "22:45",
    status: "confirmed",
    risk: "low",
    tags: [],
  },
  {
    id: "tb22",
    guestName: "Rivera",
    partySize: 5,
    table: "T22",
    startTime: "21:00",
    endTime: "23:00",
    status: "confirmed",
    risk: "low",
    tags: [
      { type: "anniversary", label: "Anniversary", icon: "ring" },
    ],
  },
]

// ── Ghost Blocks ─────────────────────────────────────────────────────────────

export const ghostBlocks: GhostBlock[] = [
  {
    id: "g1",
    table: "T1",
    predictedTime: "20:15",
    endTime: "22:15",
    label: "Available ~8:15",
  },
  {
    id: "g2",
    table: "T5",
    predictedTime: "20:30",
    endTime: "22:30",
    label: "Available ~8:30",
  },
  {
    id: "g3",
    table: "T14",
    predictedTime: "20:45",
    endTime: "22:45",
    label: "Available ~8:45",
    conditional: "IF Morrison shows",
  },
  {
    id: "g4",
    table: "T16",
    predictedTime: "20:30",
    endTime: "22:30",
    label: "Available ~8:30",
  },
]

// ── Merged Blocks (blocked lanes) ────────────────────────────────────────────

export const mergedBlocks: MergedBlock[] = [
  {
    table: "T9",
    mergedWith: "T8",
    startTime: "19:00",
    endTime: "21:15",
  },
  {
    table: "T24",
    mergedWith: "T23",
    startTime: "20:00",
    endTime: "22:30",
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getBlocksForTable(tableId: string): TimelineBlock[] {
  return timelineBlocks.filter((b) => b.table === tableId)
}

export function getGhostsForTable(tableId: string): GhostBlock[] {
  return ghostBlocks.filter((g) => g.table === tableId)
}

export function getMergedForTable(tableId: string): MergedBlock | undefined {
  return mergedBlocks.find((m) => m.table === tableId)
}

export function getTablesForZone(zoneId: string): TableLane[] {
  return tableLanes.filter((t) => t.zone === zoneId)
}

export function getBlockColor(status: TimelineStatus): {
  bg: string
  border: string
  text: string
} {
  switch (status) {
    case "confirmed":
      return {
        bg: "bg-blue-600/20",
        border: "border-l-blue-500",
        text: "text-blue-300",
      }
    case "seated":
      return {
        bg: "bg-emerald-600/20",
        border: "border-l-emerald-500",
        text: "text-emerald-300",
      }
    case "completed":
      return {
        bg: "bg-zinc-700/30",
        border: "border-l-zinc-500",
        text: "text-zinc-400",
      }
    case "no-show":
      return {
        bg: "bg-rose-600/20",
        border: "border-l-rose-500",
        text: "text-rose-300",
      }
    case "late":
      return {
        bg: "bg-amber-600/20",
        border: "border-l-amber-500",
        text: "text-amber-300",
      }
    case "arriving":
      return {
        bg: "bg-emerald-600/25",
        border: "border-l-emerald-400",
        text: "text-emerald-200",
      }
    case "unconfirmed":
      return {
        bg: "bg-amber-600/15",
        border: "border-l-amber-400",
        text: "text-amber-300",
      }
  }
}

export function getRiskDot(risk: "low" | "medium" | "high"): string {
  switch (risk) {
    case "low":
      return "bg-emerald-400"
    case "medium":
      return "bg-amber-400"
    case "high":
      return "bg-rose-400"
  }
}

export function getStatusLabel(block: TimelineBlock): string {
  if (block.status === "completed") return "Completed"
  if (block.status === "no-show") return "No-Show"
  if (block.status === "arriving") return "Arriving now"
  if (block.status === "unconfirmed") return "Unconfirmed"
  if (block.status === "late") return "Late"
  if (block.status === "confirmed") return "Confirmed"
  if (block.status === "seated" && block.courseProgress) {
    const labels: Record<CourseProgress, string> = {
      ordering: "Seated - Ordering",
      apps: "Seated - Apps",
      "mains-fired": "Seated - Mains firing",
      "mains-served": "Seated - Mains served",
      dessert: "Seated - Dessert",
      check: "Seated - Check",
      paying: "Seated - Paying",
    }
    return labels[block.courseProgress]
  }
  return "Seated"
}

export function formatTime12h(time24: string): string {
  const [h, m] = time24.split(":").map(Number)
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  const ampm = h >= 12 ? "PM" : "AM"
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`
}

export { restaurantConfig, capacitySlots }
