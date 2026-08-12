import { Suspense } from "react"
import { ConfirmClient } from "@/components/auth/confirm-client"

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmClient />
    </Suspense>
  )
}
