export type WaveStatus = "served" | "ready" | "preparing" | "fired" | "held"
export type ItemStatus = "served" | "ready" | "preparing" | "held"
export type Pacing = "quick" | "relaxed"

export interface WaveItem {
  id: string
  name: string
  variant?: string
  seat: number
  status: ItemStatus
  mods?: string[]
  price?: number
  eta?: number
  seatAllergy?: string
  seatNote?: string
}

export interface Wave {
  id: string
  type: "drinks" | "food" | "dessert"
  label: string
  icon: string
  status: WaveStatus
  startedAt?: string
  servedAt?: string
  eta?: number
  itemsReady: number
  itemsTotal: number
  items: WaveItem[]
}

export interface Seat {
  number: number
  dietary: string[]
  notes?: string[]
  summary: string
}

export interface TableNote {
  icon: string
  text: string
}

export interface FireControlData {
  table: {
    id: string
    number: number
    guestCount: number
    seatedAt: string
    pacing: Pacing
    bill: {
      subtotal: number
      tax: number
      total: number
    }
  }
  seats: Seat[]
  notes: TableNote[]
  waves: Wave[]
}

// Config Maps
export const waveStatusConfig: Record<
  WaveStatus,
  { color: string; icon: string; label: string; border: string; pulse?: boolean }
> = {
  served: {
    color: "green",
    icon: "✅",
    label: "Served",
    border: "#22c55e",
  },
  ready: {
    color: "red",
    icon: "🔴",
    label: "Ready!",
    border: "#ef4444",
    pulse: true,
  },
  preparing: {
    color: "yellow",
    icon: "🟡",
    label: "Preparing",
    border: "#eab308",
  },
  fired: {
    color: "orange",
    icon: "🔥",
    label: "Fired",
    border: "#f97316",
  },
  held: {
    color: "gray",
    icon: "⏸️",
    label: "Held",
    border: "#6b7280",
  },
}

export const itemStatusConfig: Record<ItemStatus, { icon: string; label: string }> = {
  served: { icon: "✅", label: "Served" },
  ready: { icon: "✅", label: "Ready" },
  preparing: { icon: "🟡", label: "Preparing" },
  held: { icon: "⏸️", label: "Held" },
}

export const dietaryIcons: Record<string, string> = {
  nut_allergy: "🥜",
  vegetarian: "🌱",
  vegan: "🌿",
  gluten_free: "🌾",
}

// Mock Data
export const fireControlData: FireControlData = {
  table: {
    id: "t12",
    number: 12,
    guestCount: 4,
    seatedAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    pacing: "relaxed",
    bill: {
      subtotal: 127.5,
      tax: 12.75,
      total: 140.25,
    },
  },
  seats: [
    { number: 1, dietary: [], summary: "Steak, Salad, Coke" },
    { number: 2, dietary: ["nut_allergy"], summary: "Pasta, Wine" },
    { number: 3, dietary: [], notes: ["Birthday 🎂"], summary: "Salmon, Water" },
    { number: 4, dietary: [], summary: "Burger, Beer" },
  ],
  notes: [
    { icon: "🎂", text: "Birthday (Seat 3)" },
    { icon: "🥜", text: "Nut allergy (Seat 2)" },
  ],
  waves: [
    {
      id: "w1",
      type: "drinks",
      label: "Drinks",
      icon: "🍹",
      status: "served",
      startedAt: new Date(Date.now() - 27 * 60 * 1000).toISOString(),
      servedAt: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
      itemsReady: 4,
      itemsTotal: 4,
      items: [
        { id: "i1", name: "Coke", seat: 1, status: "served" },
        {
          id: "i2",
          name: "Glass of Chianti",
          seat: 2,
          status: "served",
          seatAllergy: "nut_allergy",
        },
        { id: "i3", name: "Sparkling Water", seat: 3, status: "served" },
        { id: "i4", name: "Beer", seat: 4, status: "served" },
      ],
    },
    {
      id: "w2",
      type: "food",
      label: "Food",
      icon: "🍽️",
      status: "preparing",
      startedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      eta: 6,
      itemsReady: 3,
      itemsTotal: 5,
      items: [
        { id: "i5", name: "Caesar Salad", seat: 1, status: "ready" },
        {
          id: "i6",
          name: "Pasta Carbonara",
          seat: 2,
          status: "ready",
          mods: ["− NO nuts (ALLERGY)"],
          seatAllergy: "nut_allergy",
        },
        { id: "i7", name: "Salmon", seat: 3, status: "ready" },
        {
          id: "i8",
          name: "Ribeye Steak",
          variant: "Medium",
          seat: 1,
          status: "preparing",
          mods: ["+ Peppercorn sauce"],
          eta: 5,
        },
        {
          id: "i9",
          name: "Burger",
          seat: 4,
          status: "preparing",
          mods: ["+ Bacon", "+ Cheese"],
          eta: 3,
        },
      ],
    },
    {
      id: "w3",
      type: "dessert",
      label: "Dessert",
      icon: "🍰",
      status: "held",
      itemsReady: 0,
      itemsTotal: 2,
      items: [
        { id: "i10", name: "Tiramisu", seat: 1, status: "held", price: 12.0 },
        {
          id: "i11",
          name: "Panna Cotta",
          seat: 3,
          status: "held",
          price: 10.0,
          seatNote: "Birthday 🎂",
        },
      ],
    },
  ],
}

// Helper functions
export function minutesAgo(iso: string): number {
  return Math.round((Date.now() - new Date(iso).getTime()) / 60000)
}

export function formatCurrency(amount: number): string {
  return `€${amount.toFixed(2)}`
}

export function getHeldWaves(waves: Wave[]): Wave[] {
  return waves.filter((w) => w.status === "held")
}
