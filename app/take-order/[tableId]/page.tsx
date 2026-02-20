"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { TakeOrderTopBar } from "@/components/take-order/take-order-top-bar"
import { AllergyAlert } from "@/components/take-order/allergy-alert"
import { SeatSelector } from "@/components/take-order/seat-selector"
import { CategoryNav } from "@/components/take-order/category-nav"
import { MenuSearch } from "@/components/take-order/menu-search"
import { MenuItemCard } from "@/components/take-order/menu-item-card"
import { CustomizeItemModal } from "@/components/take-order/customize-item-modal"
import type { ItemCustomization } from "@/components/take-order/customize-item-modal"
import { OrderSummary } from "@/components/take-order/order-summary"
import { TakeOrderActionBar } from "@/components/take-order/take-order-action-bar"
import { SendConfirmationDialog } from "@/components/take-order/send-confirmation-dialog"
import { OrderSuccessDialog } from "@/components/take-order/order-success-dialog"
import {
  takeOrderData,
  hasAllergyConflict,
  calculateOrderTotals,
  formatCurrency,
} from "@/lib/take-order-data"
import type { MenuItem, OrderItem, Seat } from "@/lib/take-order-data"

export default function TakeOrderPage() {
  const router = useRouter()

  // State
  const [selectedSeatNumber, setSelectedSeatNumber] = useState(
    takeOrderData.selectedSeat
  )
  const [selectedCategory, setSelectedCategory] = useState("drinks")
  const [searchQuery, setSearchQuery] = useState("")
  const [seats, setSeats] = useState<Seat[]>(takeOrderData.seats)
  const [orderItems, setOrderItems] = useState<OrderItem[]>(
    takeOrderData.currentOrder.items
  )
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null)
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [mobileOrderOpen, setMobileOrderOpen] = useState(false)

  const selectedSeat = seats.find((s) => s.number === selectedSeatNumber)

  // Filter menu items
  const filteredItems = useMemo(() => {
    let items = takeOrderData.menuItems

    // Filter by category
    if (selectedCategory && !searchQuery.trim()) {
      items = items.filter((item) => item.category === selectedCategory)
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      )
    }

    return items
  }, [selectedCategory, searchQuery])
  const matchedCategoryIds = useMemo(
    () => Array.from(new Set(filteredItems.map((item) => item.category))),
    [filteredItems]
  )

  // Calculate totals
  const totals = useMemo(
    () => calculateOrderTotals(orderItems),
    [orderItems]
  )

  // Add item to order
  const handleAddToOrder = useCallback((customization: ItemCustomization) => {
    const newItem: OrderItem = {
      id: `o${Date.now()}`,
      menuItemId: customization.menuItemId,
      name: customization.name,
      seat: customization.seat,
      quantity: customization.quantity,
      options: customization.options,
      extras: customization.extras,
      notes: customization.notes,
      price: customization.totalPrice,
      wave: takeOrderData.menuItems.find((m) => m.id === customization.menuItemId)
        ?.category === "drinks"
        ? "drinks"
        : "food",
    }

    setOrderItems((prev) => [...prev, newItem])

    // Update seat totals
    setSeats((prev) =>
      prev.map((seat) =>
        seat.number === customization.seat
          ? {
              ...seat,
              items: seat.items + customization.quantity,
              total: seat.total + customization.totalPrice * customization.quantity,
            }
          : seat
      )
    )

    setMobileOrderOpen(false)
  }, [])

  // Update item quantity
  const handleQuantityChange = useCallback((itemId: string, delta: number) => {
    setOrderItems((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQuantity = Math.max(1, item.quantity + delta)
            return { ...item, quantity: newQuantity }
          }
          return item
        })
    )
  }, [])

  // Remove item
  const handleRemoveItem = useCallback((itemId: string) => {
    const item = orderItems.find((i) => i.id === itemId)
    if (!item) return

    setOrderItems((prev) => prev.filter((i) => i.id !== itemId))

    // Update seat totals
    setSeats((prev) =>
      prev.map((seat) =>
        seat.number === item.seat
          ? {
              ...seat,
              items: Math.max(0, seat.items - item.quantity),
              total: Math.max(0, seat.total - item.price * item.quantity),
            }
          : seat
      )
    )
  }, [orderItems])

  // Clear all items
  const handleClearAll = useCallback(() => {
    if (confirm("Clear all items from the order?")) {
      setOrderItems([])
      setSeats((prev) =>
        prev.map((seat) => ({ ...seat, items: 0, total: 0 }))
      )
    }
  }, [])

  // Send to kitchen
  const handleSendToKitchen = useCallback(() => {
    setShowSendDialog(true)
  }, [])

  const handleConfirmSend = useCallback((holdFood: boolean) => {
    console.log("[v0] Sending order to kitchen, holdFood:", holdFood)
    setShowSendDialog(false)
    setShowSuccessDialog(true)
  }, [])

  const handleBackToTable = useCallback(() => {
    router.push(`/table/${takeOrderData.table.id}`)
  }, [router])

  const handleAddMore = useCallback(() => {
    setShowSuccessDialog(false)
    setOrderItems([])
    setSeats((prev) => prev.map((seat) => ({ ...seat, items: 0, total: 0 })))
  }, [])

  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* Top Bar */}
      <TakeOrderTopBar
        tableNumber={takeOrderData.table.number}
        selectedSeat={selectedSeat}
        orderTotal={totals.total}
        onDone={handleBackToTable}
      />

      {/* Allergy Alert */}
      {selectedSeat && <AllergyAlert seat={selectedSeat} />}

      {/* Seat Selector */}
      <SeatSelector
        seats={seats}
        selectedSeatNumber={selectedSeatNumber}
        onSelectSeat={setSelectedSeatNumber}
        onAddGuest={() => {
          const newSeatNumber = Math.max(...seats.map((s) => s.number)) + 1
          setSeats([
            ...seats,
            {
              number: newSeatNumber,
              dietary: [],
              items: 0,
              total: 0,
            },
          ])
          setSelectedSeatNumber(newSeatNumber)
        }}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop: Category Sidebar */}
        <aside className="hidden w-48 shrink-0 border-r border-border bg-card lg:block">
          <CategoryNav
            categories={takeOrderData.categories}
            selectedCategory={selectedCategory}
            selectedCategories={searchQuery.trim() ? matchedCategoryIds : undefined}
            onSelectCategory={setSelectedCategory}
            variant="vertical"
          />
        </aside>

        {/* Menu Area */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile/Tablet: Category Tabs */}
          <div className="lg:hidden">
            <CategoryNav
              categories={takeOrderData.categories}
              selectedCategory={selectedCategory}
              selectedCategories={searchQuery.trim() ? matchedCategoryIds : undefined}
              onSelectCategory={setSelectedCategory}
              variant="horizontal"
            />
          </div>

          {/* Search Bar */}
          <div className="border-b border-border bg-card p-4">
            <MenuSearch value={searchQuery} onChange={setSearchQuery} />
          </div>

          {/* Menu Items Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
              {filteredItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  categoryLabel={
                    searchQuery.trim()
                      ? takeOrderData.categories.find((c) => c.id === item.category)?.name ??
                        item.category
                      : undefined
                  }
                  hasAllergyConflict={
                    selectedSeat
                      ? hasAllergyConflict(item, selectedSeat.dietary)
                      : false
                  }
                  onClick={setCustomizingItem}
                />
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="flex h-64 items-center justify-center">
                <p className="text-muted-foreground">No items found</p>
              </div>
            )}
          </div>
        </main>

        {/* Desktop/Tablet: Order Summary Sidebar */}
        <aside className="hidden w-80 shrink-0 border-l border-border md:block xl:w-96">
          <OrderSummary
            items={orderItems}
            seats={seats}
            total={totals.total}
            onQuantityChange={handleQuantityChange}
            onEditItem={(itemId) => {
              const item = orderItems.find((i) => i.id === itemId)
              if (item) {
                const menuItem = takeOrderData.menuItems.find(
                  (m) => m.id === item.menuItemId
                )
                if (menuItem) setCustomizingItem(menuItem)
              }
            }}
            onRemoveItem={handleRemoveItem}
          />
        </aside>
      </div>

      {/* Action Bar */}
      <TakeOrderActionBar
        itemCount={orderItems.length}
        total={totals.total}
        onTableNote={() => alert("Table note feature")}
        onClearAll={handleClearAll}
        onSendToKitchen={handleSendToKitchen}
      />

      {/* Mobile: Order Summary Bottom Sheet */}
      <div className="md:hidden">
        <Sheet open={mobileOrderOpen} onOpenChange={setMobileOrderOpen}>
          <SheetTrigger asChild>
            <Button
              variant="secondary"
              className="fixed bottom-20 right-4 h-14 gap-2 rounded-full px-6 shadow-lg"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="font-semibold">
                {orderItems.length} items · {formatCurrency(totals.total)}
              </span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] p-0">
            <OrderSummary
              items={orderItems}
              seats={seats}
              total={totals.total}
              onQuantityChange={handleQuantityChange}
              onEditItem={(itemId) => {
                const item = orderItems.find((i) => i.id === itemId)
                if (item) {
                  const menuItem = takeOrderData.menuItems.find(
                    (m) => m.id === item.menuItemId
                  )
                  if (menuItem) {
                    setCustomizingItem(menuItem)
                    setMobileOrderOpen(false)
                  }
                }
              }}
              onRemoveItem={handleRemoveItem}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Customize Item Modal */}
      <CustomizeItemModal
        item={customizingItem}
        seats={seats}
        defaultSeat={selectedSeatNumber}
        open={!!customizingItem}
        onClose={() => setCustomizingItem(null)}
        onAddToOrder={handleAddToOrder}
      />

      {/* Send Confirmation Dialog */}
      <SendConfirmationDialog
        open={showSendDialog}
        tableNumber={takeOrderData.table.number}
        items={orderItems}
        total={totals.total}
        onClose={() => setShowSendDialog(false)}
        onConfirm={handleConfirmSend}
      />

      {/* Success Dialog */}
      <OrderSuccessDialog
        open={showSuccessDialog}
        itemCount={orderItems.length}
        onAddMore={handleAddMore}
        onBackToTable={handleBackToTable}
      />
    </div>
  )
}
