import { redirect } from "next/navigation"

export default function ReservationDetailPage() {
  redirect("/reservations?detail=res_001")
}
