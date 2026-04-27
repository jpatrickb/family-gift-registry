import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GiftCard } from "@/components/gifts/gift-card"
import { GiftTagMotif, LumenIcon } from "@/components/shared/brand"
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

  const giftList = (gifts ?? []) as Gift[]

  return (
    <div>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 24,
          marginBottom: 28,
        }}
      >
        <div>
          <h1 className="t-h1" style={{ margin: 0 }}>My Lumen List</h1>
          <p className="t-body" style={{ marginTop: 8, maxWidth: 580 }}>
            Items you&apos;d love. Family members can quietly mark when they&apos;ve bought something — no spoilers.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0, paddingTop: 4 }}>
          <Link href="/gifts/new" className="ds-btn ds-btn-secondary">
            <LumenIcon name="link" size={14} />
            Paste a link
          </Link>
          <Link href="/gifts/new" className="ds-btn ds-btn-primary">
            <LumenIcon name="plus" size={14} />
            Add gift
          </Link>
        </div>
      </div>

      {giftList.length === 0 ? (
        /* Empty state */
        <div
          className="ds-card"
          style={{
            border: "1px dashed var(--hairline-strong)",
            padding: "56px 32px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <GiftTagMotif size={200} />
          <h2 className="t-display-sm" style={{ margin: "8px 0 0" }}>
            Nothing on your list — yet.
          </h2>
          <p className="t-body" style={{ maxWidth: 440, color: "var(--ink-3)", margin: 0 }}>
            Drop in a few things you&apos;ve had your eye on. Your family can see them, claim what
            they&apos;d like to get you, and quietly check things off.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <Link href="/gifts/new" className="ds-btn ds-btn-primary">
              <LumenIcon name="plus" size={14} />
              Add your first gift
            </Link>
          </div>

          <div
            style={{
              marginTop: 28,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
              maxWidth: 560,
              width: "100%",
            }}
          >
            {[
              { icon: "tag" as const, t: "Add a few items", d: "Books, kitchen things, anything." },
              { icon: "users" as const, t: "Share with families", d: "All your families will see your list." },
              { icon: "heart" as const, t: "Surprise stays in", d: "You won't see who got what." },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  textAlign: "left",
                  padding: 14,
                  borderRadius: 10,
                  background: "var(--surface-2)",
                  border: "1px solid var(--hairline)",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    background: "var(--primary-soft)",
                    color: "oklch(0.40 0.14 285)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 8,
                  }}
                >
                  <LumenIcon name={s.icon} size={13} />
                </span>
                <div className="t-h3" style={{ fontSize: 13.5 }}>{s.t}</div>
                <div className="t-body-sm" style={{ color: "var(--ink-3)", marginTop: 2, fontSize: 12.5 }}>
                  {s.d}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Gift grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 18,
            }}
          >
            {giftList.map((gift) => (
              <GiftCard key={gift.id} gift={gift} isOwner={true} showClaimStatus={false} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
