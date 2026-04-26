import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { UserMenu } from "./user-menu"

export async function Nav({ userId }: { userId: string }) {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileRaw } = await (supabase as any)
    .from("profiles")
    .select("name, email, avatar_url")
    .eq("id", userId)
    .single()
  const profile = profileRaw as { name: string; email: string; avatar_url: string | null } | null

  // Get families the user is a member of via memberships
  const { data: membershipsRaw } = await (supabase as any)
    .from("family_members")
    .select("family_id")
    .eq("user_id", userId)
  const memberships = (membershipsRaw ?? []) as { family_id: string }[]
  const familyIds = memberships.map((m) => m.family_id)

  const families: { id: string; name: string }[] =
    familyIds.length > 0
      ? (((await (supabase as any).from("families").select("id, name").in("id", familyIds)).data ?? []) as { id: string; name: string }[])
      : []

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 max-w-6xl flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-semibold text-lg">
            Gift Registry
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link href="/gifts" className="text-gray-600 hover:text-gray-900">
              My Wishlist
            </Link>
            {families.map((f) => (
              <Link
                key={f.id}
                href={`/families/${f.id}`}
                className="text-gray-600 hover:text-gray-900"
              >
                {f.name}
              </Link>
            ))}
          </nav>
        </div>
        <UserMenu
          name={profile?.name ?? ""}
          email={profile?.email ?? ""}
          avatarUrl={profile?.avatar_url ?? null}
        />
      </div>
    </header>
  )
}
