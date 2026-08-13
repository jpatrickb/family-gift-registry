import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { forgotPasswordSchema } from "@/lib/validations"
import { sendPasswordResetEmail } from "@/lib/resend"

// Always the same response whether or not the email is registered
// (anti-enumeration) — an email only goes out when an account exists.
const GENERIC_SUCCESS = { success: true } as const

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = forgotPasswordSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 })
  }
  const { email } = parsed.data
  const origin = new URL(request.url).origin

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: `${origin}/confirm?next=${encodeURIComponent("/reset-password")}`,
    },
  })

  if (!error) {
    // Best-effort: a send failure here must not change the response, or
    // its presence/absence would itself reveal whether the account exists.
    await sendPasswordResetEmail({ to: email, resetUrl: data.properties.action_link }).catch((err) =>
      console.error("Failed to send password reset email:", err)
    )
  }

  return NextResponse.json(GENERIC_SUCCESS)
}
