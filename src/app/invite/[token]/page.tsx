import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { AcceptInviteButton } from "@/components/family/accept-invite-button"

type Params = { params: Promise<{ token: string }> }

type InviteData = {
  families: { name: string } | null
  profiles: { name: string } | null
}

export default async function InvitePage({ params }: Params) {
  const { token } = await params
  let invite: InviteData | null = null
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any
    const { data: inviteRaw } = await admin
      .from("family_invites")
      .select("*, families(name), profiles!invited_by(name)")
      .eq("token", token)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .single()
    invite = inviteRaw as InviteData | null
  } catch {
    invite = null
  }

  if (!invite) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold">Invite not found</h1>
          <p className="text-gray-600">
            This invite may have expired or already been used.
          </p>
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

  const familyName = invite.families?.name ?? "a family"
  const inviterName = invite.profiles?.name ?? "Someone"

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div>
          <h1 className="text-2xl font-bold">You&apos;re invited!</h1>
          <p className="text-gray-600 mt-2">
            {inviterName} has invited you to join <strong>{familyName}</strong> on
            Lumen List.
          </p>
        </div>

        {user ? (
          <AcceptInviteButton token={token} />
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Sign in or create an account to accept this invitation.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href={`/login?next=/invite/${token}`}
                className="inline-flex items-center justify-center rounded-md bg-black text-white px-4 py-2 text-sm font-medium"
              >
                Sign in
              </Link>
              <Link
                href={`/signup?next=/invite/${token}`}
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
