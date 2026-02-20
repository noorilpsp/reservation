import { ReservationFormView } from "@/components/reservations/reservation-form-view"

export default function NewReservationPage() {
  return (
    <div className="h-screen">
      <ReservationFormView mode="create" />
    </div>
  )
}
