import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

type Params = { params: Promise<{ giftId: string }> }

export async function POST(request: Request, { params }: Params) {
  const { giftId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const status = body.status === "purchased" ? "purchased" : "claimed"

  // Server-side guard: prevent claiming your own gift
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: giftRaw } = await (supabase as any)
    .from("gifts")
    .select("owner_id")
    .eq("id", giftId)
    .single()
  const gift = giftRaw as { owner_id: string } | null

  if (!gift) {
    return NextResponse.json({ error: "Gift not found" }, { status: 404 })
  }
  if (gift.owner_id === user.id) {
    return NextResponse.json(
      { error: "You cannot claim your own gift" },
      { status: 403 }
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: claim, error } = await (supabase as any)
    .from("gift_claims")
    .insert({ gift_id: giftId, claimed_by: user.id, status })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ claim }, { status: 201 })
}

export async function PATCH(request: Request, { params }: Params) {
  const { giftId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const status = body.status === "purchased" ? "purchased" : "claimed"

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: claim, error } = await (supabase as any)
    .from("gift_claims")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("gift_id", giftId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ claim })
}

export async function DELETE(_: Request, { params }: Params) {
  const { giftId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { error } = await supabase
    .from("gift_claims")
    .delete()
    .eq("gift_id", giftId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
