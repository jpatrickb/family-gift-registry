"use client"

import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface UserMenuProps {
  name: string
  email: string
  avatarUrl: string | null
  initials?: string
  tone?: string
}

export function UserMenu({ name, email, initials: userInitials, tone }: UserMenuProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  async function signOut() {
    setOpen(false)
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const nameInitials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?"
  const fallbackInitials = userInitials ?? nameInitials
  const toneClass = tone ?? "ds-avatar-t-1"

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        className={`ds-avatar ds-avatar-sm ${toneClass}`}
        style={{ cursor: "pointer", border: "none", background: "none", padding: 0 }}
        aria-label="User menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        {fallbackInitials}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="User menu"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            background: "var(--surface)",
            border: "1px solid var(--hairline)",
            borderRadius: 8,
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            minWidth: 220,
            zIndex: 200,
            padding: "6px 0",
          }}
        >
          <div style={{ padding: "8px 12px 10px", borderBottom: "1px solid var(--hairline)" }}>
            <div style={{ fontWeight: 500, fontSize: 14, color: "var(--ink)" }}>{name}</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{email}</div>
          </div>

          <Link
            href="/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            style={{ display: "block", padding: "8px 12px", fontSize: 14, textDecoration: "none", color: "var(--ink)" }}
          >
            Account settings
          </Link>
          <Link
            href="/families/new"
            role="menuitem"
            onClick={() => setOpen(false)}
            style={{ display: "block", padding: "8px 12px", fontSize: 14, textDecoration: "none", color: "var(--ink)" }}
          >
            Create a family
          </Link>

          <div style={{ borderTop: "1px solid var(--hairline)", marginTop: 4, paddingTop: 4 }}>
            <button
              role="menuitem"
              onClick={signOut}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "8px 12px",
                fontSize: 14,
                color: "oklch(0.45 0.2 25)",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
