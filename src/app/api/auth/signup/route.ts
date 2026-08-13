import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { signupSchema } from "@/lib/validations"
import { sendConfirmationEmail, sendAlreadyRegisteredEmail } from "@/lib/resend"

// Same generic response for a brand-new signup and an already-registered
// email, so the API never reveals which case occurred (anti-enumeration).
// A repeat signup still gets a useful email — a password-reset link — just
// not an HTTP response that confirms the account exists.
const GENERIC_SUCCESS = { success: true } as const

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = signupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid name, email, and password." }, { status: 400 })
  }
  const { name, email, password } = parsed.data

  const rawNext = typeof body?.next === "string" ? body.next : "/dashboard"
  const next = rawNext.startsWith("/") ? rawNext : "/dashboard"
  const origin = new URL(request.url).origin

  const admin = createAdminClient()

  const { data, error } = await admin.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: {
      data: { name },
      redirectTo: `${origin}/confirm?next=${encodeURIComponent(next)}`,
    },
  })

  if (error) {
    if (error.code === "email_exists") {
      const { data: recoveryData, error: recoveryError } = await admin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: {
          redirectTo: `${origin}/confirm?next=${encodeURIComponent("/reset-password")}`,
        },
      })
      if (!recoveryError) {
        // Best-effort: a send failure here must not change the response,
        // or its presence/absence would itself reveal that the account exists.
        await sendAlreadyRegisteredEmail({ to: email, resetUrl: recoveryData.properties.action_link }).catch(
          (err) => console.error("Failed to send already-registered email:", err)
        )
      }
      return NextResponse.json(GENERIC_SUCCESS)
    }
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  try {
    await sendConfirmationEmail({
      to: email,
      name,
      confirmUrl: data.properties.action_link,
    })
  } catch (err) {
    console.error("Failed to send confirmation email:", err)
    return NextResponse.json(
      { error: "Your account was created, but we couldn't send the confirmation email. Please try again." },
      { status: 502 }
    )
  }

  return NextResponse.json(GENERIC_SUCCESS)
}
