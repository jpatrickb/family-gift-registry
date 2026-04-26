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
      className="text-sm text-red-500 hover:text-red-700 underline"
    >
      {loading ? "Removing…" : "Remove"}
    </button>
  )
}
