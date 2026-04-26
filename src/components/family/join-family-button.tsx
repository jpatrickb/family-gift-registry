"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function JoinFamilyButton({ inviteCode }: { inviteCode: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function join() {
    setLoading(true)
    const res = await fetch(`/api/join/${inviteCode}`, { method: "POST" })
    const json = await res.json()
    if (!res.ok) {
      toast.error(json.error ?? "Failed to join family")
      setLoading(false)
      return
    }
    router.push(`/families/${json.familyId}`)
  }

  return (
    <Button onClick={join} disabled={loading} size="lg">
      {loading ? "Joining…" : "Join family"}
    </Button>
  )
}
