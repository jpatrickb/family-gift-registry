import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GiftTagMotif, LumenIcon, initials, avatarTone } from "@/components/shared/brand"
import type { Family, GiftClaim } from "@/types"

type ClaimWithGift = GiftClaim & {
  gifts: { id: string; title: string; price: number | null; owner_id: string } | null
}

type MemberWithProfile = {
  user_id: string
  family_id: string
  families: { name: string } | null
  profiles: { name: string } | null
}

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 18) return "Good afternoon"
  return "Good evening"
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  const { data: profileRaw } = await sb
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single()
  const profile = profileRaw as { name: string } | null
  const firstName = profile?.name?.split(" ")[0] ?? "there"

  const { data: membershipsRaw } = await sb
    .from("family_members")
    .select("family_id")
    .eq("user_id", user.id)
  const memberships = (membershipsRaw ?? []) as { family_id: string }[]
  const familyIds = memberships.map((m) => m.family_id)

  const families: Family[] =
    familyIds.length > 0
      ? (((await sb.from("families").select("*").in("id", familyIds)).data ?? []) as Family[])
      : []

  const { data: myGiftsRaw } = await sb
    .from("gifts")
    .select("id")
    .eq("owner_id", user.id)
  const giftCount = (myGiftsRaw ?? []).length

  const { data: claimsRaw } = await sb
    .from("gift_claims")
    .select("*, gifts(id, title, price, owner_id)")
    .eq("claimed_by", user.id)
    .order("created_at", { ascending: false })
    .limit(5)
  const claims = (claimsRaw ?? []) as ClaimWithGift[]

  // Other family members for "Coming up"
  const members: MemberWithProfile[] =
    familyIds.length > 0
      ? (((await sb
            .from("family_members")
            .select("user_id, family_id, families!family_id(name), profiles!user_id(name)")
            .in("family_id", familyIds)
            .neq("user_id", user.id)
            .limit(5)).data ?? []) as MemberWithProfile[])
      : []

  const pendingClaims = claims.filter((c) => c.status === "claimed").length

  return (
    <div>
      {/* Welcome hero */}
      <section
        style={{
          position: "relative",
          borderRadius: 16,
          padding: "32px 36px",
          background: "linear-gradient(180deg, var(--primary-soft) 0%, var(--background) 100%)",
          border: "1px solid var(--hairline)",
          marginBottom: 32,
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", right: 8, top: -10, opacity: 0.95, pointerEvents: "none" }}>
          <GiftTagMotif size={210} />
        </div>
        <div style={{ position: "relative", maxWidth: 540 }}>
          <div className="t-eyebrow" style={{ color: "oklch(0.42 0.14 285)", marginBottom: 12 }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
          <h1 className="t-display" style={{ margin: 0 }}>
            {greeting()},{" "}
            <em style={{ fontStyle: "italic", color: "oklch(0.40 0.16 285)" }}>{firstName}</em>.
          </h1>
          <p className="t-body" style={{ marginTop: 10, color: "var(--ink-2)" }}>
            {giftCount === 0
              ? "Your wishlist is empty. Add a few things you'd love."
              : `You have ${giftCount} item${giftCount !== 1 ? "s" : ""} on your wishlist across ${families.length} famil${families.length !== 1 ? "ies" : "y"}.`}
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
            <Link href="/gifts" className="ds-btn ds-btn-primary">
              <LumenIcon name="gift" size={14} />
              My Lumen List
            </Link>
            <Link href="/gifts/new" className="ds-btn ds-btn-secondary">
              <LumenIcon name="plus" size={14} />
              Add a gift
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 36,
        }}
      >
        {[
          {
            label: "On my wishlist",
            value: giftCount.toString(),
            meta: families.length > 0 ? `across ${families.length} famil${families.length !== 1 ? "ies" : "y"}` : "no families yet",
            icon: "gift" as const,
            accent: false,
          },
          {
            label: "I'm getting",
            value: claims.length.toString(),
            meta: pendingClaims > 0 ? `${pendingClaims} still to buy` : "all purchased",
            icon: "shoppingBag" as const,
            accent: true,
          },
          {
            label: "Families",
            value: families.length.toString(),
            meta: families.length > 0 ? families.map((f) => f.name).slice(0, 2).join(", ") : "none yet",
            icon: "users" as const,
            accent: false,
          },
          {
            label: "Members",
            value: (members.length + 1).toString(),
            meta: "in your families",
            icon: "calendar" as const,
            accent: false,
          },
        ].map((s, i) => (
          <div key={i} className="ds-card" style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div className="t-meta">{s.label}</div>
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: s.accent ? "var(--accent-amber-soft)" : "var(--primary-soft)",
                  color: s.accent ? "var(--accent-amber-fg)" : "oklch(0.40 0.14 285)",
                  flexShrink: 0,
                }}
              >
                <LumenIcon name={s.icon} size={14} />
              </span>
            </div>
            <div
              style={{
                fontFamily: "var(--font-display, Georgia, serif)",
                fontSize: 36,
                color: "var(--ink)",
                lineHeight: 1,
                marginTop: 12,
              }}
            >
              {s.value}
            </div>
            <div className="t-body-sm" style={{ color: "var(--ink-3)", marginTop: 6 }}>
              {s.meta}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom two-column section */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 28 }}>
        {/* Family members */}
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 className="t-h2" style={{ margin: 0 }}>Your families</h2>
            <Link
              href="/families/new"
              style={{ fontSize: 13, color: "oklch(0.42 0.14 285)", textDecoration: "none", fontWeight: 500 }}
            >
              Create family →
            </Link>
          </div>

          {families.length === 0 ? (
            <div
              className="ds-card"
              style={{ padding: "32px 24px", textAlign: "center" }}
            >
              <div className="t-body-sm" style={{ color: "var(--ink-3)" }}>
                You haven't joined any families yet.
              </div>
              <Link href="/families/new" className="ds-btn ds-btn-primary ds-btn-sm" style={{ marginTop: 14, display: "inline-flex" }}>
                Create your first family
              </Link>
            </div>
          ) : (
            <div className="ds-card" style={{ padding: 0 }}>
              {families.map((f, i) => (
                <div
                  key={f.id}
                  style={{
                    padding: "16px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    borderBottom: i < families.length - 1 ? "1px solid var(--hairline)" : "none",
                  }}
                >
                  <span
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "var(--primary-soft)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "oklch(0.40 0.14 285)",
                      flexShrink: 0,
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    {f.name[0]}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="t-h3" style={{ margin: 0 }}>{f.name}</div>
                    {members.filter((m) => m.family_id === f.id).length > 0 && (
                      <div className="t-body-sm" style={{ color: "var(--ink-3)", marginTop: 2 }}>
                        {members.filter((m) => m.family_id === f.id).length + 1} members
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/families/${f.id}`}
                    className="ds-btn ds-btn-ghost ds-btn-sm"
                  >
                    View
                    <LumenIcon name="chevronRight" size={14} />
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Family members list */}
          {members.length > 0 && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, marginTop: 28 }}>
                <h2 className="t-h2" style={{ margin: 0 }}>Family members</h2>
              </div>
              <div className="ds-card" style={{ padding: 0 }}>
                {members.map((m, i) => {
                  const memberName = m.profiles?.name ?? "Unknown"
                  const memberInitials = initials(memberName)
                  const tone = avatarTone(m.user_id)
                  return (
                    <div
                      key={m.user_id}
                      style={{
                        padding: "14px 18px",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        borderBottom: i < members.length - 1 ? "1px solid var(--hairline)" : "none",
                      }}
                    >
                      <span className={`ds-avatar ds-avatar-md ${tone}`}>{memberInitials}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="t-h3" style={{ margin: 0, fontSize: 14 }}>{memberName}</div>
                        {m.families?.name && (
                          <div className="t-body-sm" style={{ color: "var(--ink-3)", marginTop: 1 }}>
                            {m.families.name}
                          </div>
                        )}
                      </div>
                      <Link
                        href={`/members/${m.user_id}?familyId=${m.family_id}`}
                        className="ds-btn ds-btn-ghost ds-btn-sm"
                        style={{ flexShrink: 0 }}
                      >
                        View list
                        <LumenIcon name="chevronRight" size={14} />
                      </Link>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </section>

        {/* You're getting */}
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 className="t-h2" style={{ margin: 0 }}>You&apos;re getting</h2>
          </div>

          {claims.length === 0 ? (
            <div className="ds-card" style={{ padding: "24px 18px", textAlign: "center" }}>
              <div className="t-body-sm" style={{ color: "var(--ink-3)" }}>
                You haven't claimed any gifts yet.
              </div>
              {families.length > 0 && (
                <Link
                  href={`/families/${families[0].id}`}
                  className="ds-btn ds-btn-ghost ds-btn-sm"
                  style={{ marginTop: 10, display: "inline-flex" }}
                >
                  Browse family wishlists
                </Link>
              )}
            </div>
          ) : (
            <div className="ds-card" style={{ padding: 0 }}>
              {claims.map((c, i) => (
                <div
                  key={c.id}
                  style={{
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    borderBottom: i < claims.length - 1 ? "1px solid var(--hairline)" : "none",
                  }}
                >
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: c.status === "purchased" ? "var(--accent-amber-soft)" : "var(--primary-soft)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: c.status === "purchased" ? "var(--accent-amber-fg)" : "oklch(0.40 0.14 285)",
                      flexShrink: 0,
                    }}
                  >
                    <LumenIcon
                      name={c.status === "purchased" ? "checkCircle" : "shoppingBag"}
                      size={14}
                    />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      className="t-h3"
                      style={{
                        margin: 0,
                        fontSize: 13.5,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {c.gifts?.title ?? "Gift"}
                    </div>
                    {c.gifts?.price && (
                      <div className="t-body-sm" style={{ color: "var(--ink-3)" }}>
                        ${c.gifts.price}
                      </div>
                    )}
                  </div>
                  {c.status === "purchased" ? (
                    <span className="ds-badge ds-badge-accent">
                      <span className="ds-badge-dot" />
                      Purchased
                    </span>
                  ) : (
                    <span className="ds-badge ds-badge-primary">
                      <span className="ds-badge-dot" />
                      Claimed
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
