import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createFamilySchema } from "@/lib/validations"

type Params = { params: Promise<{ familyId: string }> }

export async function GET(_: Request, { params }: Params) {
  const { familyId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: familyRaw, error } = await (supabase as any)
    .from("families")
    .select(`*, family_members(*, profiles(*))`)
    .eq("id", familyId)
    .single()
  const family = familyRaw as {
    family_members: Array<{ user_id: string; role: string }>
    [key: string]: unknown
  } | null

  if (error || !family) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const userMember = family.family_members.find(
    (m: { user_id: string; role: string }) => m.user_id === user.id
  )

  return NextResponse.json({
    family,
    userRole: userMember?.role ?? "member",
  })
}

export async function PATCH(request: Request, { params }: Params) {
  const { familyId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const parsed = createFamilySchema.partial().safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: family, error } = await (supabase as any)
    .from("families")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", familyId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ family })
}

export async function DELETE(_: Request, { params }: Params) {
  const { familyId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { error } = await supabase
    .from("families")
    .delete()
    .eq("id", familyId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
