"use client"

import { useOptimistic, useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import type { GiftClaim } from "@/types"

interface ClaimButtonProps {
  giftId: string
  claim: GiftClaim | null
}

type ClaimState = {
  claim: GiftClaim | null
}

export function ClaimButton({ giftId, claim: initialClaim }: ClaimButtonProps) {
  const [, startTransition] = useTransition()
  const [optimisticState, setOptimistic] = useOptimistic<ClaimState>(
    { claim: initialClaim }
  )
  const [loading, setLoading] = useState(false)

  const claim = optimisticState.claim

  async function handleClaim() {
    setLoading(true)
    startTransition(() => {
      setOptimistic({ claim: { id: "temp", gift_id: giftId, claimed_by: "", status: "claimed", created_at: "", updated_at: "" } })
    })
    const res = await fetch(`/api/gifts/${giftId}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "claimed" }),
    })
    if (!res.ok) {
      startTransition(() => setOptimistic({ claim: initialClaim }))
      toast.error("Failed to claim gift")
    } else {
      const { claim: newClaim } = await res.json()
      startTransition(() => setOptimistic({ claim: newClaim }))
      toast.success("Gift claimed!")
    }
    setLoading(false)
  }

  async function handleMarkPurchased() {
    setLoading(true)
    startTransition(() => {
      setOptimistic({ claim: { ...claim!, status: "purchased" } })
    })
    const res = await fetch(`/api/gifts/${giftId}/claim`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "purchased" }),
    })
    if (!res.ok) {
      startTransition(() => setOptimistic({ claim: initialClaim }))
      toast.error("Failed to update")
    } else {
      toast.success("Marked as purchased!")
    }
    setLoading(false)
  }

  async function handleUnclaim() {
    setLoading(true)
    startTransition(() => setOptimistic({ claim: null }))
    const res = await fetch(`/api/gifts/${giftId}/claim`, { method: "DELETE" })
    if (!res.ok) {
      startTransition(() => setOptimistic({ claim: initialClaim }))
      toast.error("Failed to unclaim")
    } else {
      toast.success("Unclaimed")
    }
    setLoading(false)
  }

  if (!claim) {
    return (
      <Button size="sm" onClick={handleClaim} disabled={loading}>
        I&apos;ll get this
      </Button>
    )
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {claim.status === "claimed" && (
        <Button size="sm" variant="default" onClick={handleMarkPurchased} disabled={loading}>
          Mark purchased
        </Button>
      )}
      <Button size="sm" variant="outline" onClick={handleUnclaim} disabled={loading}>
        Unclaim
      </Button>
    </div>
  )
}
