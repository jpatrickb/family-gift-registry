import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { GiftCard } from "@/components/gifts/gift-card"
import { LumenIcon, initials, avatarTone } from "@/components/shared/brand"
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

  const { data: giftsRaw } = await giftsQuery
  const gifts = (giftsRaw ?? []) as GiftWithClaim[]

  const displayName = profile.name || profile.email
  const firstName = profile.name?.split(" ")[0] ?? displayName
  const memberInitials = initials(displayName)
  const tone = avatarTone(userId)

  const claimedCount = gifts.filter((g) => g.gift_claims?.status === "claimed" || g.gift_claims?.status === "purchased").length

  return (
    <div>
      {/* Back link */}
      {familyId && (
        <Link
          href={`/families/${familyId}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "var(--ink-3)",
            textDecoration: "none",
            fontWeight: 500,
            marginBottom: 18,
          }}
        >
          <LumenIcon name="arrowLeft" size={14} />
          Back to family
        </Link>
      )}

      {/* Header */}
      <section style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 8 }}>
        <span className={`ds-avatar ds-avatar-xl ${tone}`}>{memberInitials}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="t-display-sm" style={{ margin: 0 }}>
            <em style={{ fontStyle: "italic", color: "oklch(0.40 0.16 285)" }}>{firstName}&apos;s</em> wishlist
          </h1>
          <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
            <span className="t-body" style={{ color: "var(--ink-2)" }}>
              {gifts.length} item{gifts.length !== 1 ? "s" : ""}
            </span>
            {claimedCount > 0 && (
              <>
                <span className="ds-dot" />
                <span className="t-body" style={{ color: "var(--ink-3)" }}>
                  {claimedCount} already claimed
                </span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Helper banner */}
      <div
        style={{
          background: "var(--primary-soft)",
          border: "1px solid oklch(0.88 0.04 285)",
          borderRadius: 12,
          padding: "14px 18px",
          margin: "24px 0 28px",
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "var(--surface)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "oklch(0.42 0.14 285)",
            flexShrink: 0,
          }}
        >
          <LumenIcon name="sparkle" size={14} />
        </span>
        <div className="t-body-sm" style={{ color: "var(--ink-2)", flex: 1 }}>
          <strong style={{ color: "var(--ink)" }}>{firstName} can&apos;t see who claimed what.</strong> Pick
          something you want to get them, then mark it as purchased when it arrives.
        </div>
      </div>

      {/* Gift list */}
      {gifts.length === 0 ? (
        <div
          className="ds-card"
          style={{ padding: "48px 32px", textAlign: "center" }}
        >
          <div className="t-display-sm" style={{ color: "var(--ink-3)" }}>Nothing here yet</div>
          <p className="t-body" style={{ color: "var(--ink-3)", marginTop: 8 }}>
            {displayName} hasn&apos;t added any gifts yet.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {gifts.map((gift) => (
            <GiftCard
              key={gift.id}
              gift={gift}
              isOwner={false}
              showClaimStatus={true}
              currentUserId={user.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
