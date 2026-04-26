import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

type Params = { params: Promise<{ inviteCode: string }> }

export async function POST(_: Request, { params }: Params) {
  const { inviteCode: inviteCodeRaw } = await params
  const inviteCode = inviteCodeRaw.trim().toLowerCase()
  if (!/^[a-z0-9]{12}$/.test(inviteCode)) {
    return NextResponse.json({ error: "Invalid invite link" }, { status: 404 })
  }
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const admin = createAdminClient()

  const { data: familyRaw, error: familyError } = await admin
    .from("families")
    .select("id, name")
    .ilike("invite_code", inviteCode)
    .maybeSingle()
  const family = familyRaw as { id: string; name: string } | null

  if (familyError || !family) {
    return NextResponse.json({ error: "Invalid invite link" }, { status: 404 })
  }

  const { data: existingMember } = await admin
    .from("family_members")
    .select("id")
    .eq("family_id", family.id)
    .eq("user_id", user.id)
    .single()

  if (!existingMember) {
    const { error: memberError } = await admin
      .from("family_members")
      .insert({ family_id: family.id, user_id: user.id, role: "member" })

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ familyId: family.id })
}
