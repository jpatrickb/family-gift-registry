"use client"

import { useOptimistic, useState, useTransition } from "react"
import { toast } from "sonner"
import { LumenIcon } from "@/components/shared/brand"
import type { GiftClaim } from "@/types"

interface ClaimButtonProps {
  giftId: string
  claim: GiftClaim | null
  isMyClaim: boolean
}

type ClaimState = {
  claim: GiftClaim | null
}

export function ClaimButton({ giftId, claim: initialClaim, isMyClaim: initialIsMyClaim }: ClaimButtonProps) {
  const [, startTransition] = useTransition()
  const [optimisticState, setOptimistic] = useOptimistic<ClaimState>({ claim: initialClaim })
  const [loading, setLoading] = useState(false)
  const [isMyClaim, setIsMyClaim] = useState(initialIsMyClaim)

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
      setIsMyClaim(true)
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
      setIsMyClaim(false)
      toast.success("Unclaimed")
    }
    setLoading(false)
  }

  async function handleUndo() {
    setLoading(true)
    startTransition(() => {
      setOptimistic({ claim: { ...claim!, status: "claimed" } })
    })
    const res = await fetch(`/api/gifts/${giftId}/claim`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "claimed" }),
    })
    if (!res.ok) {
      startTransition(() => setOptimistic({ claim: initialClaim }))
      toast.error("Failed to undo")
    }
    setLoading(false)
  }

  if (!claim) {
    return (
      <button
        className="ds-btn ds-btn-primary ds-btn-sm"
        onClick={handleClaim}
        disabled={loading}
      >
        <LumenIcon name="heart" size={13} />
        I&apos;ll get this
      </button>
    )
  }

  if (claim.status === "purchased" && isMyClaim) {
    return (
      <div style={{ display: "flex", gap: 8 }}>
        <button className="ds-btn ds-btn-ghost ds-btn-sm" onClick={handleUndo} disabled={loading}>
          Undo
        </button>
      </div>
    )
  }

  if (claim.status === "claimed" && isMyClaim) {
    return (
      <div style={{ display: "flex", gap: 8 }}>
        <button className="ds-btn ds-btn-accent ds-btn-sm" onClick={handleMarkPurchased} disabled={loading}>
          <LumenIcon name="check" size={13} />
          Mark purchased
        </button>
        <button className="ds-btn ds-btn-ghost ds-btn-sm" onClick={handleUnclaim} disabled={loading}>
          Unclaim
        </button>
      </div>
    )
  }

  // Someone else claimed it
  return (
    <button className="ds-btn ds-btn-ghost ds-btn-sm" disabled>
      Someone&apos;s got it
    </button>
  )
}
