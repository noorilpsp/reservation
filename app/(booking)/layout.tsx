import React from "react"

export const metadata = {
  title: "Chez Laurent — Reserve a Table",
  description: "Book your table at Chez Laurent, Fine Dining in Brussels. Quick, easy reservation in under 30 seconds.",
}

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="booking-widget-root min-h-dvh">
      {children}
    </div>
  )
}
