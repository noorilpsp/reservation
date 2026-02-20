// ── Waitlist Intelligence System — Data Layer ───────────────────────────────

export type WaitlistLocation =
  | "at-restaurant"
  | "at-bar"
  | "stepped-out"
  | "left-area"
  | "just-arrived"
  | "just-added"

export type MatchStatus = "ready-now" | "turning-soon" | "long-wait" | "merge-option"

export type SortMode = "smart" | "wait-time" | "party-size" | "quoted-time"

export interface TableMatch {
  tableId: string
  seats: number
  zone: string
  detail: string // e.g. "Window", "Outdoor"
  status: MatchStatus
  estMinutes: number // 0 = available now
  reason?: string // e.g. "Williams finishing dessert"
}

export interface MergeOption {
  tables: string[]
  combinedSeats: number
  estTime: string // e.g. "~8:30"
  reason?: string
}

export interface WaitlistEntry {
  id: string
  name: string
  partySize: number
  quotedWait: number // minutes
  joinedAt: number // minutes after 17:00 (absolute for timer calc)
  location: WaitlistLocation
  phone?: string
  barTab?: number
  notes?: string
  preferences?: string
  smsSent?: boolean
  smsStatus?: string // e.g. "Confirmed at restaurant", "SMS sent — browsing menu"
  bestMatch: TableMatch | null
  altMatches: TableMatch[]
  mergeOption?: MergeOption
}

export interface CompletedEntry {
  id: string
  name: string
  partySize: number
  joinedTime: string // display time e.g. "6:00 PM"
  waitedMin: number
  quotedMin: number
  withinQuote: boolean
}

export interface RemovedEntry {
  id: string
  name: string
  partySize: number
  time: string
  reason: string // "Left after 15 min", "Cancelled via SMS", etc.
}

export interface AvailableTable {
  id: string
  seats: number
  zone: string
  detail: string
  status: "available-now" | "turning-soon" | "occupied"
  estMinutes: number
  currentParty?: string
  courseStage?: string
}

export interface QuoteAccuracy {
  totalSeated: number
  withinQuote: number
  accuracyPct: number
  avgOverquoteMin: number
  avgUnderquoteMin: number
  underquoteCount: number
  tip: string
  suggestedQuote?: string
}

// ── Constants ────────────────────────────────────────────────────────────────

export const CURRENT_TIME = "7:23 PM"
export const CURRENT_DATE = "Fri, Jan 17"
export const SERVICE_PERIOD = "Dinner"
// Minutes since 17:00 that equals "now"
export const NOW_MINUTES = 143 // 7:23 PM = 143 min after 17:00

// ── Active Waitlist (8 parties) ──────────────────────────────────────────────

export const activeWaitlist: WaitlistEntry[] = [
  {
    id: "wl-1",
    name: "Rodriguez Family",
    partySize: 4,
    quotedWait: 25,
    joinedAt: 125, // joined at 7:05 PM → 18 min ago
    location: "at-restaurant",
    phone: "+1 (555) 123-4567",
    smsSent: true,
    smsStatus: "Confirmed at restaurant",
    notes: "Kids with us, need highchair",
    preferences: "Prefers indoor",
    bestMatch: {
      tableId: "T3",
      seats: 4,
      zone: "Main Dining",
      detail: "Window",
      status: "ready-now",
      estMinutes: 0,
    },
    altMatches: [
      { tableId: "T7", seats: 4, zone: "Main Dining", detail: "Center", status: "turning-soon", estMinutes: 15, reason: "Kim Family — mains" },
      { tableId: "T14", seats: 4, zone: "Main Dining", detail: "Corner", status: "turning-soon", estMinutes: 10, reason: "Martinez wrapping up" },
    ],
  },
  {
    id: "wl-2",
    name: "Kim & Park",
    partySize: 2,
    quotedWait: 15,
    joinedAt: 131, // joined at 7:11 PM → 12 min ago
    location: "at-bar",
    barTab: 67,
    phone: "+1 (555) 234-5678",
    smsSent: true,
    smsStatus: "At the bar",
    bestMatch: {
      tableId: "T1",
      seats: 2,
      zone: "Main Dining",
      detail: "Banquette",
      status: "turning-soon",
      estMinutes: 8,
      reason: "Williams finishing dessert",
    },
    altMatches: [
      { tableId: "T21", seats: 2, zone: "Patio", detail: "Outdoor", status: "ready-now", estMinutes: 0 },
    ],
  },
  {
    id: "wl-3",
    name: "Thompson Group",
    partySize: 6,
    quotedWait: 40,
    joinedAt: 138, // joined at 7:18 PM → 5 min ago
    location: "at-restaurant",
    phone: "+1 (555) 345-6789",
    smsSent: true,
    smsStatus: "SMS sent — browsing menu on phone",
    notes: "Celebrating promotion, budget flexible",
    bestMatch: {
      tableId: "T22",
      seats: 6,
      zone: "Main Dining",
      detail: "Round table",
      status: "turning-soon",
      estMinutes: 35,
      reason: "Anderson party — finishing",
    },
    altMatches: [],
    mergeOption: {
      tables: ["T15", "T16"],
      combinedSeats: 8,
      estTime: "~8:30",
      reason: "Both clearing after current seatings",
    },
  },
  {
    id: "wl-4",
    name: "Yusuf Ali",
    partySize: 2,
    quotedWait: 20,
    joinedAt: 140, // joined at 7:20 PM → 3 min ago
    location: "at-restaurant",
    phone: "+1 (555) 456-7890",
    smsSent: true,
    smsStatus: "Confirmed at restaurant",
    bestMatch: {
      tableId: "T3",
      seats: 4,
      zone: "Main Dining",
      detail: "Window",
      status: "turning-soon",
      estMinutes: 7,
      reason: "If Rodriguez seated now",
    },
    altMatches: [
      { tableId: "T1", seats: 2, zone: "Main Dining", detail: "Banquette", status: "turning-soon", estMinutes: 8, reason: "Williams finishing" },
    ],
  },
  {
    id: "wl-5",
    name: "O'Connor & Davies",
    partySize: 3,
    quotedWait: 30,
    joinedAt: 141, // joined at 7:21 PM → 2 min ago
    location: "at-restaurant",
    phone: "+32 (0)2 345 6789",
    smsSent: false,
    notes: "Allergy: gluten-free needed",
    bestMatch: null,
    altMatches: [],
  },
  {
    id: "wl-6",
    name: "Sato",
    partySize: 2,
    quotedWait: 10,
    joinedAt: 142, // joined at 7:22 PM → 1 min ago
    location: "just-arrived",
    phone: "+1 (555) 567-8901",
    smsSent: true,
    smsStatus: "Just arrived",
    notes: "Anniversary dinner",
    bestMatch: {
      tableId: "T1",
      seats: 2,
      zone: "Main Dining",
      detail: "Banquette",
      status: "turning-soon",
      estMinutes: 8,
      reason: "Williams finishing dessert",
    },
    altMatches: [
      { tableId: "T21", seats: 2, zone: "Patio", detail: "Outdoor", status: "ready-now", estMinutes: 0 },
    ],
  },
  {
    id: "wl-7",
    name: "Petrova & Ivanov",
    partySize: 4,
    quotedWait: 35,
    joinedAt: 143, // just added
    location: "just-added",
    phone: "+1 (555) 678-9012",
    smsSent: false,
    notes: "Quiet area preferred",
    bestMatch: null,
    altMatches: [],
  },
  {
    id: "wl-8",
    name: "Mensah Family",
    partySize: 5,
    quotedWait: 45,
    joinedAt: 143, // just added
    location: "stepped-out",
    phone: "+1 (555) 789-0123",
    smsSent: true,
    smsStatus: "Will be back in 10 min",
    bestMatch: null,
    altMatches: [],
    mergeOption: {
      tables: ["T10", "T12"],
      combinedSeats: 8,
      estTime: "~8:45",
      reason: "After Chen party finishes",
    },
  },
]

// ── Available / Turning Tables ───────────────────────────────────────────────

export const availableTables: AvailableTable[] = [
  { id: "T3", seats: 4, zone: "Main Dining", detail: "Window", status: "available-now", estMinutes: 0 },
  { id: "T21", seats: 2, zone: "Patio", detail: "Outdoor", status: "available-now", estMinutes: 0 },
  { id: "T1", seats: 2, zone: "Main Dining", detail: "Banquette", status: "turning-soon", estMinutes: 8, currentParty: "Williams", courseStage: "Dessert" },
  { id: "T7", seats: 4, zone: "Main Dining", detail: "Center", status: "turning-soon", estMinutes: 15, currentParty: "Kim Family", courseStage: "Mains" },
  { id: "T22", seats: 6, zone: "Main Dining", detail: "Round table", status: "turning-soon", estMinutes: 35, currentParty: "Anderson", courseStage: "Finishing" },
]

export const mergeOptions = [
  { tables: ["T15", "T16"], combinedSeats: 8, estTime: "~8:30" },
  { tables: ["T10", "T12"], combinedSeats: 8, estTime: "~8:45", reason: "After Chen" },
]

// ── Completed Today (15 parties) ─────────────────────────────────────────────

export const completedEntries: CompletedEntry[] = [
  { id: "c1", name: "Martinez", partySize: 4, joinedTime: "5:15 PM", waitedMin: 12, quotedMin: 15, withinQuote: true },
  { id: "c2", name: "Brown", partySize: 2, joinedTime: "5:30 PM", waitedMin: 8, quotedMin: 10, withinQuote: true },
  { id: "c3", name: "Davis", partySize: 3, joinedTime: "5:40 PM", waitedMin: 22, quotedMin: 20, withinQuote: false },
  { id: "c4", name: "Lee Family", partySize: 5, joinedTime: "5:50 PM", waitedMin: 18, quotedMin: 25, withinQuote: true },
  { id: "c5", name: "Johnson", partySize: 2, joinedTime: "6:00 PM", waitedMin: 5, quotedMin: 10, withinQuote: true },
  { id: "c6", name: "Nakamura", partySize: 4, joinedTime: "6:10 PM", waitedMin: 14, quotedMin: 15, withinQuote: true },
  { id: "c7", name: "Hernandez", partySize: 3, joinedTime: "6:15 PM", waitedMin: 20, quotedMin: 20, withinQuote: true },
  { id: "c8", name: "Patel", partySize: 6, joinedTime: "6:20 PM", waitedMin: 38, quotedMin: 35, withinQuote: false },
  { id: "c9", name: "O'Brien", partySize: 2, joinedTime: "6:30 PM", waitedMin: 10, quotedMin: 15, withinQuote: true },
  { id: "c10", name: "Chen", partySize: 4, joinedTime: "6:35 PM", waitedMin: 12, quotedMin: 15, withinQuote: true },
  { id: "c11", name: "Williams", partySize: 2, joinedTime: "6:40 PM", waitedMin: 7, quotedMin: 10, withinQuote: true },
  { id: "c12", name: "Kim", partySize: 3, joinedTime: "6:50 PM", waitedMin: 16, quotedMin: 20, withinQuote: true },
  { id: "c13", name: "Garcia", partySize: 4, joinedTime: "6:55 PM", waitedMin: 22, quotedMin: 25, withinQuote: true },
  { id: "c14", name: "Singh", partySize: 2, joinedTime: "7:00 PM", waitedMin: 9, quotedMin: 10, withinQuote: true },
  { id: "c15", name: "Andersen", partySize: 5, joinedTime: "7:05 PM", waitedMin: 15, quotedMin: 20, withinQuote: true },
]

// ── Removed (3 parties) ─────────────────────────────────────────────────────

export const removedEntries: RemovedEntry[] = [
  { id: "rm1", name: "Garcia", partySize: 4, time: "6:45 PM", reason: "Left after 15 min" },
  { id: "rm2", name: "Wilson", partySize: 2, time: "7:00 PM", reason: "Cancelled via SMS" },
  { id: "rm3", name: "Taylor", partySize: 6, time: "7:15 PM", reason: "No response after 45 min" },
]

// ── Quote Accuracy ───────────────────────────────────────────────────────────

export const quoteAccuracy: QuoteAccuracy = {
  totalSeated: 15,
  withinQuote: 13,
  accuracyPct: 87,
  avgOverquoteMin: 4,
  avgUnderquoteMin: 8,
  underquoteCount: 2,
  tip: "You're slightly underquoting 6-tops.",
  suggestedQuote: "Quote 45 min instead of 35 for 6+ guests",
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getElapsedMinutes(entry: WaitlistEntry): number {
  return NOW_MINUTES - entry.joinedAt
}

export function getProgressPct(entry: WaitlistEntry): number {
  const elapsed = getElapsedMinutes(entry)
  return Math.min(Math.round((elapsed / entry.quotedWait) * 100), 120)
}

export function getProgressStatus(entry: WaitlistEntry): "normal" | "warning" | "overdue" {
  const pct = getProgressPct(entry)
  if (pct >= 100) return "overdue"
  if (pct >= 70) return "warning"
  return "normal"
}

export function getLocationLabel(loc: WaitlistLocation): string {
  switch (loc) {
    case "at-restaurant": return "At restaurant"
    case "at-bar": return "At the bar"
    case "stepped-out": return "Stepped out"
    case "left-area": return "Left area"
    case "just-arrived": return "Just arrived"
    case "just-added": return "Just added"
  }
}

export function getActiveStats() {
  const parties = activeWaitlist.length
  const guests = activeWaitlist.reduce((sum, e) => sum + e.partySize, 0)
  const elapsedTimes = activeWaitlist.map(getElapsedMinutes)
  const avgWait = Math.round(elapsedTimes.reduce((a, b) => a + b, 0) / parties)
  const longestWait = Math.max(...elapsedTimes)
  return { parties, guests, avgWait, longestWait, accuracyPct: quoteAccuracy.accuracyPct }
}

/** Smart sort: prioritizes parties with ready-now matches, then by wait time ratio */
export function sortWaitlist(entries: WaitlistEntry[], mode: SortMode): WaitlistEntry[] {
  const sorted = [...entries]
  switch (mode) {
    case "smart":
      return sorted.sort((a, b) => {
        const aReady = a.bestMatch?.status === "ready-now" ? 1 : 0
        const bReady = b.bestMatch?.status === "ready-now" ? 1 : 0
        if (aReady !== bReady) return bReady - aReady
        const aRatio = getElapsedMinutes(a) / a.quotedWait
        const bRatio = getElapsedMinutes(b) / b.quotedWait
        return bRatio - aRatio
      })
    case "wait-time":
      return sorted.sort((a, b) => getElapsedMinutes(b) - getElapsedMinutes(a))
    case "party-size":
      return sorted.sort((a, b) => a.partySize - b.partySize)
    case "quoted-time": {
      return sorted.sort((a, b) => {
        const aRemaining = a.quotedWait - getElapsedMinutes(a)
        const bRemaining = b.quotedWait - getElapsedMinutes(b)
        return aRemaining - bRemaining
      })
    }
  }
}

/** Get AI-suggested quote based on party size and current table availability */
export function getAiQuoteEstimate(partySize: number): { minutes: number; explanation: string } {
  if (partySize <= 2) return { minutes: 15, explanation: "2 tables turning in ~8-10 min, quick seating likely" }
  if (partySize <= 4) return { minutes: 25, explanation: "3 tables turning in ~15-20 min, 1 no-show risk (may free T14 sooner)" }
  if (partySize <= 5) return { minutes: 40, explanation: "Needs 6-top or merge. T22 turning in ~35 min, merge T15+T16 at ~8:30" }
  return { minutes: 45, explanation: "Large party — limited 6-tops. T22 est. ~35 min, or merge T10+T12 at ~8:45" }
}
