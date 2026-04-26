import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { JoinFamilyButton } from "@/components/family/join-family-button"

type Params = { params: Promise<{ inviteCode: string }> }
const authDebugEnabled = process.env.AUTH_DEBUG === "true"

function logJoinDebug(event: string, data: Record<string, unknown>) {
  if (!authDebugEnabled) return
  console.error("[join-page]", event, data)
}

export default async function JoinPage({ params }: Params) {
  const { inviteCode: inviteCodeRaw } = await params
  const inviteCode = inviteCodeRaw.trim().toLowerCase()
  const isValidCodeFormat = /^[a-z0-9]{12}$/.test(inviteCode)
  let family: { id: string; name: string } | null = null
  let lookupFailed = false
  try {
    const admin = createAdminClient()
    const { data: familyRaw, error } = await admin
      .from("families")
      .select("id, name")
      .ilike("invite_code", inviteCode)
      .maybeSingle()
    if (error) {
      lookupFailed = true
      logJoinDebug("lookup-error", {
        inviteCode,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      })
    }
    family = familyRaw as { id: string; name: string } | null
    logJoinDebug("lookup-result", {
      inviteCode,
      isValidCodeFormat,
      familyFound: Boolean(family),
      supabaseHost: process.env.NEXT_PUBLIC_SUPABASE_URL
        ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
        : null,
      hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    })
  } catch {
    lookupFailed = true
    logJoinDebug("lookup-exception", {
      inviteCode,
      hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    })
  }

  if (!family) {
    const heading = !isValidCodeFormat
      ? "Invalid link"
      : lookupFailed
        ? "Invite lookup unavailable"
        : "Invalid link"
    const description = !isValidCodeFormat
      ? "This invite code format is invalid."
      : lookupFailed
        ? "We couldn't validate this invite link right now. Please try again."
        : "This invite link doesn't exist."

    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold">{heading}</h1>
          <p className="text-gray-600">{description}</p>
          <Link href="/login" className="text-sm underline">
            Go to login
          </Link>
        </div>
      </div>
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Join {family.name}</h1>
          <p className="text-gray-600 mt-2">
            You&apos;ve been invited to join <strong>{family.name}</strong> on Lumen List.
          </p>
        </div>

        {user ? (
          <JoinFamilyButton inviteCode={inviteCode} />
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Sign in or create an account to join this family.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href={`/login?next=/join/${inviteCode}`}
                className="inline-flex items-center justify-center rounded-md bg-black text-white px-4 py-2 text-sm font-medium"
              >
                Sign in
              </Link>
              <Link
                href={`/signup?next=/join/${inviteCode}`}
                className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium"
              >
                Create account
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
