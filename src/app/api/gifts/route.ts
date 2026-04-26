import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { giftSchema } from "@/lib/validations"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const familyId = searchParams.get("familyId")
  const userId = searchParams.get("userId")

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let query = supabase.from("gifts").select("*")

  if (userId && userId !== user.id) {
    // Viewing someone else's gifts — include claim data
    query = supabase
      .from("gifts")
      .select("*, gift_claims(*)")
      .eq("owner_id", userId)
    if (familyId) query = query.eq("family_id", familyId)
  } else {
    // Viewing own gifts — no claim data
    query = query.eq("owner_id", user.id)
    if (familyId) query = query.eq("family_id", familyId)
  }

  const { data: gifts, error } = await query.order("sort_order", {
    ascending: true,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ gifts })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const parsed = giftSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: gift, error } = await (supabase as any)
    .from("gifts")
    .insert({
      owner_id: user.id,
      family_id: parsed.data.family_id,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      price: parsed.data.price ? parseFloat(parsed.data.price) : null,
      url: parsed.data.url ?? null,
      image_url: parsed.data.image_url ?? null,
      source: "manual",
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ gift }, { status: 201 })
}
