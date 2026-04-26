import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

type Params = { params: Promise<{ token: string }> }

// Temporary diagnostic endpoint — remove after debugging
export async function GET(_: Request, { params }: Params) {
  const { token } = await params

  // Only allow authenticated users (Account A) to hit this
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any

  const { data, error } = await admin
    .from("family_invites")
    .select("*, families(name), profiles!invited_by(name)")
    .eq("token", token)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .single()

  return NextResponse.json({
    data,
    error,
    serviceRoleKeySet: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    serviceRoleKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20),
  })
}
