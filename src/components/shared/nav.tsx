import Link from "next/link"
import dynamic from "next/dynamic"
import { createClient } from "@/lib/supabase/server"
import { BrandMark, LumenIcon, initials, avatarTone } from "./brand"

// Base UI's Menu.Trigger adds aria/data attributes only on the client,
// causing a hydration mismatch. Render the whole user menu client-only.
const UserMenu = dynamic(
  () => import("./user-menu").then((m) => ({ default: m.UserMenu })),
  { ssr: false }
)

export async function Nav({ userId }: { userId: string }) {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileRaw } = await (supabase as any)
    .from("profiles")
    .select("name, email, avatar_url")
    .eq("id", userId)
    .single()
  const profile = profileRaw as { name: string; email: string; avatar_url: string | null } | null

  const userInitials = profile?.name ? initials(profile.name) : (profile?.email?.[0] ?? "?").toUpperCase()
  const userTone = avatarTone(userId)

  return (
    <header
      style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--hairline)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "0 28px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        {/* Left: brand + nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link
            href="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
            }}
          >
            <BrandMark size={28} />
            <span
              style={{
                fontFamily: "var(--font-display, Georgia, serif)",
                fontSize: 20,
                color: "var(--ink)",
                letterSpacing: "-0.005em",
              }}
            >
              Lumen
            </span>
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {[
              { href: "/dashboard", label: "Home", icon: "home" as const },
              { href: "/gifts", label: "My Lumen List", icon: "gift" as const },
              { href: "/families", label: "Families", icon: "users" as const },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "8px 12px",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--ink-3)",
                  transition: "background 120ms ease, color 120ms ease",
                }}
                className="nav-link"
              >
                <LumenIcon name={item.icon} size={14} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: search, bell, avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            className="ds-btn ds-btn-ghost ds-btn-icon ds-btn-sm"
            aria-label="Search"
            style={{ borderRadius: 8 }}
          >
            <LumenIcon name="search" size={16} />
          </button>

          <button
            className="ds-btn ds-btn-ghost ds-btn-icon ds-btn-sm"
            aria-label="Notifications"
            style={{ position: "relative", borderRadius: 8 }}
          >
            <LumenIcon name="bell" size={16} />
          </button>

          <div style={{ width: 1, height: 22, background: "var(--hairline)", margin: "0 6px" }} />

          <UserMenu
            name={profile?.name ?? ""}
            email={profile?.email ?? ""}
            avatarUrl={profile?.avatar_url ?? null}
            initials={userInitials}
            tone={userTone}
          />
        </div>
      </div>

      <style>{`
        .nav-link:hover {
          background: var(--surface-3);
          color: var(--ink);
        }
      `}</style>
    </header>
  )
}
