import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { inviteMemberSchema } from "@/lib/validations"
import { sendInviteEmail } from "@/lib/resend"

type Params = { params: Promise<{ familyId: string }> }

export async function POST(request: Request, { params }: Params) {
  const { familyId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const parsed = inviteMemberSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // Verify caller is a family member
  const { data: membership } = await supabase
    .from("family_members")
    .select("id")
    .eq("family_id", familyId)
    .eq("user_id", user.id)
    .single()

  if (!membership) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 })
  }

  const [familyResult, profileResult] = await Promise.all([
    supabase.from("families").select("name").eq("id", familyId).single(),
    supabase.from("profiles").select("name").eq("id", user.id).single(),
  ])
  const familyData = familyResult.data as { name: string } | null
  const profileData = profileResult.data as { name: string } | null

  if (!familyData) {
    return NextResponse.json({ error: "Family not found" }, { status: 404 })
  }

  // Delete any existing invite for this email+family so we can create a fresh one
  await supabase
    .from("family_invites")
    .delete()
    .eq("family_id", familyId)
    .eq("email", parsed.data.email)

  const insertResult = await supabase
    .from("family_invites")
    .insert({
      family_id: familyId,
      invited_by: user.id,
      email: parsed.data.email,
    })
    .select("token")
    .single()
  const inviteError = insertResult.error
  const invite = insertResult.data as { token: string } | null

  if (inviteError || !invite) {
    return NextResponse.json(
      { error: inviteError?.message ?? "Failed to create invite" },
      { status: 500 }
    )
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    ""
  )
  const inviteUrl = `${appUrl}/invite/${invite.token}`

  await sendInviteEmail({
    to: parsed.data.email,
    inviterName: profileData?.name ?? "A family member",
    familyName: familyData.name,
    inviteUrl,
  })

  return NextResponse.json({ success: true })
}
