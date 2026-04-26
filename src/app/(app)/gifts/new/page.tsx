import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GiftForm } from "@/components/gifts/gift-form"
import { KindredIcon } from "@/components/shared/brand"

export default async function NewGiftPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: families } = await supabase
    .from("families")
    .select("id, name, family_members!inner(user_id)")
    .eq("family_members.user_id", user.id)

  if (!families || families.length === 0) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center", padding: "64px 0" }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: "var(--primary-soft)",
            color: "oklch(0.42 0.14 285)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <KindredIcon name="users" size={22} />
        </div>
        <h1 className="t-h1" style={{ margin: 0 }}>Join a family first</h1>
        <p className="t-body" style={{ marginTop: 10, color: "var(--ink-3)" }}>
          You need to be part of a family group before you can share gifts.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 20 }}>
          <Link href="/families/new" className="ds-btn ds-btn-primary">
            Create a family
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      {/* Back */}
      <Link
        href="/gifts"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          color: "var(--ink-3)",
          textDecoration: "none",
          fontWeight: 500,
          marginBottom: 20,
        }}
      >
        <KindredIcon name="arrowLeft" size={14} />
        My wishlist
      </Link>

      <h1 className="t-display-sm" style={{ margin: 0 }}>Add a gift</h1>
      <p className="t-body" style={{ marginTop: 8, marginBottom: 32, color: "var(--ink-3)" }}>
        Paste a link to auto-fill details, or enter them yourself.
      </p>

      <GiftForm families={families} />
    </div>
  )
}
