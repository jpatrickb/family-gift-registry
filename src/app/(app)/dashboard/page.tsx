import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Family } from "@/types"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Get family IDs the user belongs to
  const { data: membershipsRaw } = await supabase
    .from("family_members")
    .select("*")
    .eq("user_id", user.id)
  const memberships = (membershipsRaw ?? []) as { family_id: string }[]

  const familyIds = memberships.map((m) => m.family_id)

  const families: Family[] =
    familyIds.length > 0
      ? (((await supabase.from("families").select("*").in("id", familyIds)).data ?? []) as Family[])
      : []

  const { data: myGiftsRaw } = await supabase
    .from("gifts")
    .select("*")
    .eq("owner_id", user.id)
  const giftCount = (myGiftsRaw ?? []).length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-gray-600 mt-1">
          Manage your wishlists and family groups
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My Wishlist</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{giftCount}</p>
            <p className="text-sm text-gray-500">gifts added</p>
            <Button asChild className="mt-4 w-full" variant="outline" size="sm">
              <Link href="/gifts">Manage wishlist</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">My Families</h2>
          <Button asChild size="sm">
            <Link href="/families/new">Create family</Link>
          </Button>
        </div>
        {families.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {families.map((family) => (
              <Card key={family.id}>
                <CardHeader>
                  <CardTitle className="text-base">{family.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/families/${family.id}`}>View family</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              <p>You haven&apos;t joined any families yet.</p>
              <Button asChild className="mt-4" size="sm">
                <Link href="/families/new">Create your first family</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
