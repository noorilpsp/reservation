import { redirect } from "next/navigation"

export default function EditReservationPage() {
  redirect("/reservations?action=edit&id=res_001")
}
