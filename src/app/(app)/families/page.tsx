import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

type FamilySummary = {
  id: string
  name: string
  created_by: string
  family_members: { user_id: string }[]
}

export default async function FamiliesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: memberships } = await supabase
    .from("family_members")
    .select("family_id")
    .eq("user_id", user.id)

  const familyIds = (memberships ?? []).map((m) => m.family_id)

  const families: FamilySummary[] =
    familyIds.length === 0
      ? []
      : ((await supabase
          .from("families")
          .select("id, name, created_by, family_members(user_id)")
          .in("id", familyIds)
          .order("created_at", { ascending: true })).data as FamilySummary[] | null) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Families</h1>
        <Link href="/families/new" className="ds-btn ds-btn-primary">
          Create family
        </Link>
      </div>

      {families.length === 0 ? (
        <div className="ds-card p-8 text-center">
          <p className="text-sm text-gray-600">You haven&apos;t joined any families yet.</p>
          <Link href="/families/new" className="ds-btn ds-btn-primary ds-btn-sm mt-4 inline-flex">
            Create your first family
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {families.map((family) => {
            const memberCount = family.family_members?.length ?? 0
            const isOwner = family.created_by === user.id

            return (
              <article key={family.id} className="ds-card p-5 space-y-3">
                <h2 className="text-lg font-semibold">{family.name}</h2>
                <p className="text-sm text-gray-600">
                  {memberCount} member{memberCount !== 1 ? "s" : ""} ·{" "}
                  {isOwner ? "You are the owner" : "You are a member"}
                </p>
                <div className="flex gap-2">
                  <Link href={`/families/${family.id}`} className="ds-btn ds-btn-secondary ds-btn-sm">
                    View family
                  </Link>
                  {isOwner && (
                    <Link
                      href={`/families/${family.id}/settings`}
                      className="ds-btn ds-btn-ghost ds-btn-sm"
                    >
                      Settings
                    </Link>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
