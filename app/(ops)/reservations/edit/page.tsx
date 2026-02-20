import { ReservationFormView } from "@/components/reservations/reservation-form-view"

export default function EditReservationPage() {
  return (
    <div className="h-screen">
      <ReservationFormView mode="edit" />
    </div>
  )
}
