import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { GiftCard } from "@/components/gifts/gift-card"
import type { Gift } from "@/types"

export default async function MyGiftsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: gifts } = await supabase
    .from("gifts")
    .select("*")
    .eq("owner_id", user.id)
    .order("sort_order", { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Wishlist</h1>
          <p className="text-gray-600 mt-1">
            Items you want — family members can see these and mark when they&apos;ve
            bought something
          </p>
        </div>
        <Button asChild>
          <Link href="/gifts/new">Add gift</Link>
        </Button>
      </div>

      {gifts && gifts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gifts.map((gift: Gift) => (
            <GiftCard key={gift.id} gift={gift} isOwner={true} showClaimStatus={false} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <p>Your wishlist is empty.</p>
          <Button asChild className="mt-4" size="sm">
            <Link href="/gifts/new">Add your first gift</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
