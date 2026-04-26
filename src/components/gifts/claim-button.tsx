"use client"

import { useState } from "react"
import { toast } from "sonner"
import { LumenIcon } from "@/components/shared/brand"
import type { GiftClaim } from "@/types"

interface ClaimButtonProps {
  giftId: string
  claim: GiftClaim | null
  isMyClaim: boolean
}

export function ClaimButton({ giftId, claim: initialClaim, isMyClaim: initialIsMyClaim }: ClaimButtonProps) {
  const [claim, setClaim] = useState<GiftClaim | null>(initialClaim)
  const [loading, setLoading] = useState(false)
  const [isMyClaim, setIsMyClaim] = useState(initialIsMyClaim)

  async function handleClaim() {
    setLoading(true)
    const res = await fetch(`/api/gifts/${giftId}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "claimed" }),
    })
    if (!res.ok) {
      toast.error("Failed to claim gift")
    } else {
      const { claim: newClaim } = await res.json()
      setClaim(newClaim)
      setIsMyClaim(true)
      toast.success("Gift claimed!")
    }
    setLoading(false)
  }

  async function handleMarkPurchased() {
    setLoading(true)
    const res = await fetch(`/api/gifts/${giftId}/claim`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "purchased" }),
    })
    if (!res.ok) {
      toast.error("Failed to update")
    } else {
      setClaim((prev) => (prev ? { ...prev, status: "purchased" } : prev))
      toast.success("Marked as purchased!")
    }
    setLoading(false)
  }

  async function handleUnclaim() {
    setLoading(true)
    const res = await fetch(`/api/gifts/${giftId}/claim`, { method: "DELETE" })
    if (!res.ok) {
      toast.error("Failed to unclaim")
    } else {
      setClaim(null)
      setIsMyClaim(false)
      toast.success("Unclaimed")
    }
    setLoading(false)
  }

  async function handleUndo() {
    setLoading(true)
    const res = await fetch(`/api/gifts/${giftId}/claim`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "claimed" }),
    })
    if (!res.ok) {
      toast.error("Failed to undo")
    } else {
      setClaim((prev) => (prev ? { ...prev, status: "claimed" } : prev))
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
