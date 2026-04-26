import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { JoinFamilyButton } from "@/components/family/join-family-button"

type Params = { params: Promise<{ inviteCode: string }> }

export default async function JoinPage({ params }: Params) {
  const { inviteCode } = await params
  let family: { id: string; name: string } | null = null
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any
    const { data: familyRaw } = await admin
      .from("families")
      .select("id, name")
      .eq("invite_code", inviteCode)
      .single()
    family = familyRaw as { id: string; name: string } | null
  } catch {
    family = null
  }

  if (!family) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold">Invalid link</h1>
          <p className="text-gray-600">This invite link doesn&apos;t exist.</p>
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
            You&apos;ve been invited to join <strong>{family.name}</strong> on Gift
            Registry.
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
