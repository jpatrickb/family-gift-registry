import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

type Params = { params: Promise<{ token: string }> }

type InviteRow = {
  id: string
  family_id: string
  token: string
  families: { name: string } | null
}

export async function POST(_: Request, { params }: Params) {
  const { token } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any

  const { data: inviteRaw, error: inviteError } = await admin
    .from("family_invites")
    .select("*, families(name)")
    .eq("token", token)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .single()
  const invite = inviteRaw as InviteRow | null

  if (inviteError || !invite) {
    return NextResponse.json(
      { error: "Invite not found or expired" },
      { status: 404 }
    )
  }

  // Check if user is already a member
  const { data: existingMember } = await admin
    .from("family_members")
    .select("id")
    .eq("family_id", invite.family_id)
    .eq("user_id", user.id)
    .single()

  if (!existingMember) {
    const { error: memberError } = await admin
      .from("family_members")
      .insert({ family_id: invite.family_id, user_id: user.id, role: "member" })

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 })
    }
  }

  await admin
    .from("family_invites")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invite.id)

  return NextResponse.json({ familyId: invite.family_id })
}
