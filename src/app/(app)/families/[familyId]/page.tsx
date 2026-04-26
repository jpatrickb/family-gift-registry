import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

type FamilyMemberRow = {
  user_id: string
  role: string
  profiles: { name: string; email: string }
}

type FamilyRow = {
  id: string
  name: string
  created_by: string
  invite_code: string
  created_at: string
  updated_at: string
  family_members: FamilyMemberRow[]
}

type Params = { params: Promise<{ familyId: string }> }

export default async function FamilyPage({ params }: Params) {
  const { familyId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: familyRaw } = await supabase
    .from("families")
    .select("*, family_members(*, profiles(*))")
    .eq("id", familyId)
    .single()
  const family = familyRaw as FamilyRow | null

  if (!family) notFound()

  const isOwner = family.created_by === user.id

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{family.name}</h1>
          <p className="text-gray-600 mt-1">
            {family.family_members.length} member
            {family.family_members.length !== 1 ? "s" : ""}
          </p>
        </div>
        {isOwner && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/families/${familyId}/settings`}>Settings</Link>
          </Button>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Members</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {family.family_members.map((member) => {
            const isCurrentUser = member.user_id === user.id
            const initials = member.profiles.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)

            return (
              <Card key={member.user_id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{initials || "?"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm truncate">
                        {member.profiles.name || member.profiles.email}
                        {isCurrentUser && " (you)"}
                      </CardTitle>
                      {member.role === "owner" && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          Owner
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {!isCurrentUser ? (
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link
                        href={`/members/${member.user_id}?familyId=${familyId}`}
                      >
                        View wishlist
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href="/gifts">My wishlist</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
