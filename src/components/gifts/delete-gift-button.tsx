"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function DeleteGiftButton({ giftId }: { giftId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function deleteGift() {
    if (!confirm("Remove this gift from your wishlist?")) return
    setLoading(true)
    const res = await fetch(`/api/gifts/${giftId}`, { method: "DELETE" })
    if (!res.ok) {
      toast.error("Failed to delete gift")
    } else {
      toast.success("Gift removed")
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <button
      onClick={deleteGift}
      disabled={loading}
      style={{
        fontSize: 12.5,
        color: "oklch(0.58 0.20 25)",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        fontFamily: "inherit",
      }}
    >
      {loading ? "Removing…" : "Remove"}
    </button>
  )
}
