import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Profile } from "@/types"

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data } = await supabase
    .from("profiles")
    .select("name, email, avatar_url")
    .eq("id", user.id)
    .single()
  const profile = data as Pick<Profile, "name" | "email" | "avatar_url"> | null

  const fallbackName =
    (typeof user.user_metadata?.name === "string" && user.user_metadata.name.trim()) ||
    user.email?.split("@")[0] ||
    "—"
  const displayName = profile?.name?.trim() || fallbackName
  const displayEmail = profile?.email || user.email || "—"

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Account</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <span className="text-gray-500">Name</span>
            <p className="font-medium">{displayName}</p>
          </div>
          <div>
            <span className="text-gray-500">Email</span>
            <p className="font-medium">{displayEmail}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
