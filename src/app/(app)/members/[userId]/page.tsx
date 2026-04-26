import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { GiftCard } from "@/components/gifts/gift-card"
import { Button } from "@/components/ui/button"
import type { GiftWithClaim } from "@/types"

type Params = {
  params: Promise<{ userId: string }>
  searchParams: Promise<{ familyId?: string }>
}

export default async function MemberWishlistPage({ params, searchParams }: Params) {
  const { userId } = await params
  const { familyId } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  if (userId === user.id) redirect("/gifts")

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()
  const profile = profileRaw as { name: string; email: string } | null

  if (!profile) notFound()

  let giftsQuery = supabase
    .from("gifts")
    .select("*, gift_claims(*)")
    .eq("owner_id", userId)
    .order("sort_order", { ascending: true })

  if (familyId) {
    giftsQuery = giftsQuery.eq("family_id", familyId)
  }

  const { data: giftsRaw } = await giftsQuery
  const gifts = (giftsRaw ?? []) as GiftWithClaim[]

  const displayName = profile.name || profile.email

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{displayName}&apos;s Wishlist</h1>
          <p className="text-gray-600 mt-1">
            Items {displayName} wants — claim one to let others know you&apos;re
            buying it
          </p>
        </div>
        {familyId && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/families/${familyId}`}>← Back to family</Link>
          </Button>
        )}
      </div>

      {gifts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gifts.map((gift) => (
            <GiftCard
              key={gift.id}
              gift={gift}
              isOwner={false}
              showClaimStatus={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <p>{displayName} hasn&apos;t added any gifts yet.</p>
        </div>
      )}
    </div>
  )
}
