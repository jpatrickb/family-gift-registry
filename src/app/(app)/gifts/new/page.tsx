import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GiftForm } from "@/components/gifts/gift-form"
import { LumenIcon } from "@/components/shared/brand"

export default async function NewGiftPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

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
        <LumenIcon name="arrowLeft" size={14} />
        My Lumen List
      </Link>

      <h1 className="t-display-sm" style={{ margin: 0 }}>Add a gift</h1>
      <p className="t-body" style={{ marginTop: 8, marginBottom: 32, color: "var(--ink-3)" }}>
        Paste a link to auto-fill details, or enter them yourself.
      </p>

      <GiftForm />
    </div>
  )
}
