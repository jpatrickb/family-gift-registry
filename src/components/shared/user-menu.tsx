"use client"

import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface UserMenuProps {
  name: string
  email: string
  avatarUrl: string | null
  initials?: string
  tone?: string
}

export function UserMenu({ name, email, avatarUrl, initials: userInitials, tone }: UserMenuProps) {
  const router = useRouter()

  async function signOut() {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const nameInitials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?"
  const fallbackInitials = userInitials ?? nameInitials

  const toneClass = tone ?? "ds-avatar-t-1"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <span
          className={`ds-avatar ds-avatar-sm ${toneClass}`}
          style={{ cursor: "pointer" }}
          aria-label="User menu"
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              width={30}
              height={30}
              style={{ borderRadius: "999px", objectFit: "cover" }}
            />
          ) : (
            fallbackInitials
          )}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="font-medium">{name}</div>
          <div className="text-xs font-normal text-muted-foreground">{email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/account")}>
          Account settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/families/new")}>
          Create a family
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} variant="destructive">
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
