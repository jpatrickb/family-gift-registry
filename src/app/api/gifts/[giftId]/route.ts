import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { giftSchema } from "@/lib/validations"

type Params = { params: Promise<{ giftId: string }> }

export async function GET(_: Request, { params }: Params) {
  const { giftId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: gift, error } = await supabase
    .from("gifts")
    .select("*")
    .eq("id", giftId)
    .single()

  if (error || !gift) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ gift })
}

export async function PATCH(request: Request, { params }: Params) {
  const { giftId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const parsed = giftSchema.partial().safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const updateData: Record<string, unknown> = {
    ...parsed.data,
    updated_at: new Date().toISOString(),
  }
  if (parsed.data.price !== undefined) {
    updateData.price = parsed.data.price ? parseFloat(parsed.data.price) : null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: gift, error } = await (supabase as any)
    .from("gifts")
    .update(updateData)
    .eq("id", giftId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ gift })
}

export async function DELETE(_: Request, { params }: Params) {
  const { giftId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { error } = await supabase
    .from("gifts")
    .delete()
    .eq("id", giftId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
