// ─── Reservation Settings Data Types & Mock Data ───────────────────────

export interface ServicePeriod {
  id: string
  name: string
  icon: string
  startTime: string
  endTime: string
  lastSeating: string
  days: string[]
  maxCovers: number
  slotInterval: number
  active: boolean
}

export interface TurnTimes {
  byPartySize: Record<string, Record<string, number>>
  bufferDefault: number
  bufferVIP: number
  bufferLargeParty: number
  smartAdjust: {
    learnFromActual: boolean
    adjustForDay: boolean
    adjustForOccasion: boolean
    adjustForWeather: boolean
  }
  currentAccuracy: number
}

export interface BookingWindow {
  advanceOnline: number
  advanceDirect: number
  advanceVIP: number
  minNoticeOnline: number
  minNoticeDirect: number
  cancellationWindow: number
  lateCancelFee: number
  noShowFee: number
  waiveFirstNoShow: boolean
  waiveVIPFees: boolean
  allowStaffOverride: boolean
  allowGuestModifyTime: boolean
  allowGuestModifySize: boolean
  allowGuestModifyTable: boolean
  cancellationPolicyText: string
}

export interface PacingSlot {
  period: string
  maxCovers: number
  label: string
}

export interface CapacitySettings {
  overbooking: "disabled" | "conservative" | "moderate"
  noShowRate: number
  pacing: { dinner: PacingSlot[] }
  autoAdjustPacing: boolean
  walkInHoldBack: number
  releaseHeldTables: number
  walkInHistorical: number
  minPartyOnline: number
  maxPartyOnline: number
  largePartyNotice: string
}

export interface ChannelConfig {
  enabled: boolean
  allocation: number
  partySizes: string
  advanceDays?: number
  requires?: string[]
  autoConfirm?: boolean
  autoConfirmMaxParty?: number
}

export interface ChannelSettings {
  online: ChannelConfig
  phone: ChannelConfig
  google: ChannelConfig
  walkIn: { allocation: number }
  instagram: { enabled: boolean }
}

export interface DepositRule {
  condition: string
  label: string
  amount: number
  perPerson: boolean
  enabled: boolean
}

export interface PrepaidExperience {
  name: string
  price: number
  perPerson?: boolean
  perCouple?: boolean
  active: boolean
}

export interface DepositSettings {
  rules: DepositRule[]
  cardOnFile: { online: boolean; phone: boolean }
  appliedToCheck: boolean
  refundPolicy: "full" | "partial" | "none"
  refundWindow: number
  processor: string
  prepaidExperiences: PrepaidExperience[]
}

export interface ConfirmationSettings {
  autoConfirmRules: {
    partyUnder5: boolean
    knownGuest: boolean
    staffBooking: boolean
    allOnline: boolean
  }
  manualConfirmRules: {
    party5Plus: boolean
    firstTimerPeak: boolean
    noShowHistory: boolean
    specialRequests: boolean
  }
  confirmVia: { sms: boolean; email: boolean }
  sendConfirmation: string
  waitForReply: number
  noReplyAction: string
  followUpWait: number
  finalAction: string
  dayOfReminder: {
    timing: number
    viaSms: boolean
    viaEmail: boolean
    scope: string
  }
  latePolicy: {
    gracePeriod: number
    autoTextAt: number
    releaseAt: number
    extendForVIP: boolean
    staffOverride: boolean
  }
}

export interface GuestPolicies {
  dressCode: { code: string; message: string }
  children: {
    policy: "welcome_all" | "before_8pm" | "not_recommended"
    countInPartySize: boolean
    offerHighChair: boolean
  }
  specialRequests: {
    enabled: boolean
    showAllergy: boolean
    showOccasion: boolean
    showSeating: boolean
    showTableRequest: boolean
    maxLength: number
  }
  noShowManagement: {
    flagAfter: number
    depositAfter: number
    blockAfter: number | null
    sendFollowUp: boolean
    autoCharge: boolean
    trackInProfile: boolean
  }
}

export interface NotificationEvent {
  event: string
  label: string
  push: boolean
  sound: boolean
  dashboard: boolean
}

export interface NotificationSettings {
  events: NotificationEvent[]
  quietHours: {
    enabled: boolean
    start: string
    end: string
    exceptions: string[]
  }
}

export interface TableConfig {
  id: string
  seats: number
  minCovers: number
  maxCovers: number
  zone: string
  features: string[]
  server: string
  active: boolean
}

export interface ReservationSettings {
  lastSavedAt: string
  lastSavedBy: string
  servicePeriods: ServicePeriod[]
  turnTimes: TurnTimes
  bookingWindow: BookingWindow
  capacity: CapacitySettings
  channels: ChannelSettings
  deposits: DepositSettings
  confirmations: ConfirmationSettings
  guestPolicies: GuestPolicies
  notifications: NotificationSettings
  tables: TableConfig[]
}

// ─── Mock Data ─────────────────────────────────────────────────────────

export const defaultSettings: ReservationSettings = {
  lastSavedAt: "2025-01-17T14:15:00",
  lastSavedBy: "Maria",

  servicePeriods: [
    { id: "sp_1", name: "Breakfast", icon: "sunrise", startTime: "07:00", endTime: "10:30", lastSeating: "10:00", days: ["mon", "tue", "wed", "thu", "fri"], maxCovers: 30, slotInterval: 30, active: true },
    { id: "sp_2", name: "Brunch", icon: "cloud-sun", startTime: "10:00", endTime: "14:30", lastSeating: "14:00", days: ["sat", "sun"], maxCovers: 55, slotInterval: 30, active: true },
    { id: "sp_3", name: "Lunch", icon: "sun", startTime: "11:30", endTime: "15:00", lastSeating: "14:30", days: ["mon", "tue", "wed", "thu", "fri"], maxCovers: 55, slotInterval: 15, active: true },
    { id: "sp_4", name: "Dinner", icon: "moon", startTime: "17:00", endTime: "23:00", lastSeating: "22:00", days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], maxCovers: 78, slotInterval: 15, active: true },
  ],

  turnTimes: {
    byPartySize: {
      lunch: { "1": 45, "2": 60, "3-4": 75, "5-6": 90, "7-8": 105, "9-10": 120, "10+": 150 },
      dinner: { "1": 60, "2": 75, "3-4": 90, "5-6": 105, "7-8": 120, "9-10": 135, "10+": 150 },
      brunch: { "1": 50, "2": 60, "3-4": 75, "5-6": 90, "7-8": 105, "9-10": 120, "10+": 150 },
    },
    bufferDefault: 15,
    bufferVIP: 20,
    bufferLargeParty: 20,
    smartAdjust: { learnFromActual: true, adjustForDay: true, adjustForOccasion: true, adjustForWeather: false },
    currentAccuracy: 0.87,
  },

  bookingWindow: {
    advanceOnline: 30,
    advanceDirect: 90,
    advanceVIP: 120,
    minNoticeOnline: 120,
    minNoticeDirect: 30,
    cancellationWindow: 240,
    lateCancelFee: 25,
    noShowFee: 50,
    waiveFirstNoShow: true,
    waiveVIPFees: false,
    allowStaffOverride: true,
    allowGuestModifyTime: true,
    allowGuestModifySize: true,
    allowGuestModifyTable: false,
    cancellationPolicyText: "Cancellations made less than 4 hours before your reservation may be subject to a $25/person fee. No-shows may be charged $50/person.",
  },

  capacity: {
    overbooking: "disabled",
    noShowRate: 0.042,
    pacing: {
      dinner: [
        { period: "17:00-18:00", maxCovers: 12, label: "Early bird, light" },
        { period: "18:00-19:00", maxCovers: 16, label: "Building" },
        { period: "19:00-20:00", maxCovers: 20, label: "Peak" },
        { period: "20:00-21:00", maxCovers: 18, label: "Peak" },
        { period: "21:00-22:00", maxCovers: 12, label: "Winding down" },
      ],
    },
    autoAdjustPacing: true,
    walkInHoldBack: 20,
    releaseHeldTables: 60,
    walkInHistorical: 0.28,
    minPartyOnline: 1,
    maxPartyOnline: 8,
    largePartyNotice: "For parties of 6 or more, a credit card is required to hold your reservation. A $25/person fee applies for no-shows.",
  },

  channels: {
    online: { enabled: true, allocation: 40, partySizes: "1-8", advanceDays: 30, requires: ["email", "phone"] },
    phone: { enabled: true, allocation: 25, partySizes: "1-10+", advanceDays: 90 },
    google: { enabled: true, allocation: 15, partySizes: "1-6", autoConfirm: true, autoConfirmMaxParty: 4 },
    walkIn: { allocation: 20 },
    instagram: { enabled: false },
  },

  deposits: {
    rules: [
      { condition: "party_6_plus", label: "Party size 6+ guests", amount: 25, perPerson: true, enabled: true },
      { condition: "peak_hours", label: "Peak hours (7-9 PM Fri/Sat)", amount: 25, perPerson: true, enabled: true },
      { condition: "no_show_history", label: "Guests with no-show history", amount: 50, perPerson: true, enabled: true },
      { condition: "special_events", label: "Special events / holidays", amount: 50, perPerson: true, enabled: true },
      { condition: "all_reservations", label: "All reservations", amount: 0, perPerson: true, enabled: false },
    ],
    cardOnFile: { online: true, phone: false },
    appliedToCheck: true,
    refundPolicy: "full",
    refundWindow: 240,
    processor: "stripe",
    prepaidExperiences: [
      { name: "Chef's Tasting Menu", price: 120, perPerson: true, active: true },
      { name: "Wine Pairing Dinner", price: 85, perPerson: true, active: true },
      { name: "Valentine's Day Special", price: 150, perCouple: true, active: true },
    ],
  },

  confirmations: {
    autoConfirmRules: { partyUnder5: true, knownGuest: true, staffBooking: true, allOnline: false },
    manualConfirmRules: { party5Plus: true, firstTimerPeak: true, noShowHistory: true, specialRequests: true },
    confirmVia: { sms: true, email: true },
    sendConfirmation: "immediately",
    waitForReply: 24,
    noReplyAction: "send_followup",
    followUpWait: 12,
    finalAction: "mark_unconfirmed",
    dayOfReminder: { timing: 360, viaSms: true, viaEmail: false, scope: "all" },
    latePolicy: { gracePeriod: 10, autoTextAt: 15, releaseAt: 30, extendForVIP: true, staffOverride: true },
  },

  guestPolicies: {
    dressCode: { code: "smart_casual", message: "Smart casual attire requested. No sportswear or flip-flops please." },
    children: { policy: "welcome_all", countInPartySize: true, offerHighChair: true },
    specialRequests: { enabled: true, showAllergy: true, showOccasion: true, showSeating: true, showTableRequest: false, maxLength: 200 },
    noShowManagement: { flagAfter: 2, depositAfter: 1, blockAfter: null, sendFollowUp: true, autoCharge: false, trackInProfile: true },
  },

  notifications: {
    events: [
      { event: "new_reservation", label: "New reservation", push: true, sound: true, dashboard: true },
      { event: "cancellation", label: "Cancellation", push: true, sound: true, dashboard: true },
      { event: "guest_confirmed", label: "Guest confirmed", push: true, sound: false, dashboard: true },
      { event: "guest_arriving", label: "Guest arriving (10 min)", push: true, sound: true, dashboard: true },
      { event: "guest_late", label: "Guest late (15+ min)", push: true, sound: true, dashboard: true },
      { event: "no_show", label: "No-show detected", push: true, sound: true, dashboard: true },
      { event: "waitlist_match", label: "Waitlist match available", push: true, sound: true, dashboard: true },
      { event: "modification", label: "Modification request", push: true, sound: false, dashboard: true },
      { event: "vip_arriving", label: "VIP arriving", push: true, sound: true, dashboard: true },
      { event: "large_party_arriving", label: "Large party (6+) arriving", push: true, sound: true, dashboard: true },
      { event: "merge_auto_split", label: "Table merge auto-split", push: true, sound: false, dashboard: true },
      { event: "capacity_warning", label: "Capacity warning (90%+)", push: true, sound: true, dashboard: true },
    ],
    quietHours: { enabled: true, start: "23:00", end: "07:00", exceptions: ["no_show", "cancellation"] },
  },

  tables: [
    { id: "T1", seats: 2, minCovers: 1, maxCovers: 2, zone: "Main Dining", features: [], server: "Anna", active: true },
    { id: "T3", seats: 2, minCovers: 1, maxCovers: 2, zone: "Main Dining", features: [], server: "Anna", active: true },
    { id: "T4", seats: 2, minCovers: 1, maxCovers: 2, zone: "Main Dining", features: [], server: "Anna", active: true },
    { id: "T5", seats: 2, minCovers: 1, maxCovers: 2, zone: "Main Dining", features: [], server: "Anna", active: true },
    { id: "T7", seats: 4, minCovers: 2, maxCovers: 4, zone: "Main Dining", features: ["booth"], server: "Mike", active: true },
    { id: "T8", seats: 4, minCovers: 2, maxCovers: 5, zone: "Main Dining", features: ["mergeable"], server: "Mike", active: true },
    { id: "T9", seats: 4, minCovers: 2, maxCovers: 5, zone: "Main Dining", features: ["mergeable"], server: "Mike", active: true },
    { id: "T10", seats: 4, minCovers: 2, maxCovers: 4, zone: "Main Dining", features: [], server: "Mike", active: true },
    { id: "T12", seats: 4, minCovers: 2, maxCovers: 4, zone: "Main Dining", features: ["window"], server: "Mike", active: true },
    { id: "T14", seats: 4, minCovers: 2, maxCovers: 4, zone: "Main Dining", features: [], server: "Lisa", active: true },
    { id: "T15", seats: 4, minCovers: 2, maxCovers: 5, zone: "Main Dining", features: ["mergeable"], server: "Lisa", active: true },
    { id: "T16", seats: 4, minCovers: 2, maxCovers: 5, zone: "Main Dining", features: ["mergeable"], server: "Lisa", active: true },
    { id: "T17", seats: 6, minCovers: 4, maxCovers: 6, zone: "Main Dining", features: ["round"], server: "Lisa", active: true },
    { id: "T18", seats: 2, minCovers: 1, maxCovers: 2, zone: "Patio", features: ["outdoor"], server: "Carlos", active: true },
    { id: "T19", seats: 4, minCovers: 2, maxCovers: 4, zone: "Patio", features: ["outdoor"], server: "Carlos", active: true },
    { id: "T20", seats: 4, minCovers: 2, maxCovers: 4, zone: "Patio", features: ["outdoor"], server: "Carlos", active: true },
    { id: "T21", seats: 2, minCovers: 1, maxCovers: 2, zone: "Patio", features: ["outdoor"], server: "Carlos", active: true },
    { id: "T22", seats: 6, minCovers: 4, maxCovers: 6, zone: "Patio", features: ["outdoor"], server: "Carlos", active: true },
    { id: "T23", seats: 6, minCovers: 4, maxCovers: 6, zone: "Private Room", features: ["private", "mergeable"], server: "Jordan", active: true },
    { id: "T24", seats: 4, minCovers: 2, maxCovers: 5, zone: "Private Room", features: ["mergeable"], server: "Jordan", active: true },
    { id: "T25", seats: 4, minCovers: 2, maxCovers: 4, zone: "Private Room", features: [], server: "Jordan", active: true },
  ],
}

// ─── Section definitions for navigation ────────────────────────────────
export const settingsSections = [
  { id: "service-periods", label: "Service Periods", icon: "clock" },
  { id: "turn-times", label: "Turn Times", icon: "timer" },
  { id: "booking-window", label: "Booking Window", icon: "calendar" },
  { id: "capacity-pacing", label: "Capacity & Pacing", icon: "bar-chart" },
  { id: "channel-allocation", label: "Channel Allocation", icon: "share-2" },
  { id: "deposits-fees", label: "Deposits & Fees", icon: "credit-card" },
  { id: "confirmations", label: "Confirmations", icon: "check-circle" },
  { id: "guest-policies", label: "Guest Policies", icon: "shield" },
  { id: "notifications", label: "Notifications", icon: "bell" },
  { id: "table-config", label: "Table Config", icon: "layout-grid" },
] as const

export type SettingsSectionId = (typeof settingsSections)[number]["id"]

// ─── Helper formatters ─────────────────────────────────────────────────
export function formatTime(time24: string): string {
  const [h, m] = time24.split(":").map(Number)
  const ampm = h >= 12 ? "PM" : "AM"
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`
}

export function formatDays(days: string[]): string {
  const dayMap: Record<string, string> = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" }
  if (days.length === 7) return "Every day"
  if (JSON.stringify(days.sort()) === JSON.stringify(["fri", "mon", "thu", "tue", "wed"])) return "Mon-Fri"
  if (JSON.stringify(days.sort()) === JSON.stringify(["sat", "sun"])) return "Sat-Sun"
  return days.map((d) => dayMap[d] || d).join(", ")
}

export function formatMinutesToHours(min: number): string {
  if (min < 60) return `${min} minutes`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h} hr ${m} min` : `${h} hour${h > 1 ? "s" : ""}`
}

export const allDays = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const
export const dayLabels: Record<string, string> = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" }
export const tableFeatures = ["Window", "Booth", "Outdoor", "Quiet", "Private", "Round", "High-top", "Bar-adjacent", "Fireplace", "Accessible", "Mergeable"]
