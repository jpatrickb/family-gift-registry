import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createFamilySchema } from "@/lib/validations"

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const parsed = createFamilySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: familyId, error } = await (supabase as any).rpc("create_family", {
    p_name: parsed.data.name,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!familyId) {
    return NextResponse.json({ error: "Failed to create family" }, { status: 500 })
  }

  return NextResponse.json({ family: { id: familyId } }, { status: 201 })
}
