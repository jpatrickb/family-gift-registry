import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { InviteMemberForm } from "@/components/family/invite-member-form"
import { CopyInviteLink } from "@/components/family/copy-invite-link"

type Params = { params: Promise<{ familyId: string }> }

export default async function FamilySettingsPage({ params }: Params) {
  const { familyId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: familyRaw } = await supabase
    .from("families")
    .select("*")
    .eq("id", familyId)
    .single()
  const family = familyRaw as { id: string; name: string; invite_code: string; created_by: string } | null

  if (!family) notFound()

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    ""
  )
  const shareableLink = `${appUrl}/join/${family.invite_code}`

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{family.name} — Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invite by email</CardTitle>
        </CardHeader>
        <CardContent>
          <InviteMemberForm familyId={familyId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Share invite link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            Anyone with this link can join {family.name}.
          </p>
          <CopyInviteLink link={shareableLink} />
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Members</CardTitle>
        </CardHeader>
        <CardContent>
          <MemberListSection familyId={familyId} currentUserId={user.id} />
        </CardContent>
      </Card>
    </div>
  )
}

async function MemberListSection({
  familyId,
  currentUserId,
}: {
  familyId: string
  currentUserId: string
}) {
  const supabase = await createClient()
  const { data: members } = await supabase
    .from("family_members")
    .select("*, profiles(*)")
    .eq("family_id", familyId)

  if (!members) return null

  return (
    <ul className="space-y-2">
      {members.map((m: { user_id: string; role: string; profiles: { name: string; email: string } }) => (
        <li key={m.user_id} className="flex items-center justify-between text-sm">
          <span>
            {m.profiles.name || m.profiles.email}
            {m.user_id === currentUserId && " (you)"}
          </span>
          <span className="text-gray-500 capitalize">{m.role}</span>
        </li>
      ))}
    </ul>
  )
}
