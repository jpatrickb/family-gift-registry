import { Resend } from "resend"

function getResendClient() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error("RESEND_API_KEY is not set")
  return new Resend(key)
}

function getFromAddress() {
  return process.env.RESEND_FROM_EMAIL ?? "Lumen List <noreply@resend.dev>"
}

// resend.emails.send() returns { data, error } rather than throwing, so a
// send failure (bad recipient, suspended domain, rate limit) looks
// identical to success unless the caller checks .error explicitly.
async function send(params: { to: string; subject: string; html: string }) {
  const resend = getResendClient()
  const { data, error } = await resend.emails.send({ from: getFromAddress(), ...params })
  if (error) {
    throw new Error(`Resend send failed: ${error.message}`)
  }
  return data
}

export async function sendInviteEmail({
  to,
  inviterName,
  familyName,
  inviteUrl,
}: {
  to: string
  inviterName: string
  familyName: string
  inviteUrl: string
}) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>You're invited to join ${familyName} on Lumen List</h2>
      <p>${inviterName} has invited you to join their family gift registry.</p>
      <p>Click the button below to accept the invitation and start sharing your wishlist.</p>
      <a href="${inviteUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        Accept Invitation
      </a>
      <p style="color: #666; font-size: 14px;">This invitation expires in 7 days. If you didn't expect this email, you can safely ignore it.</p>
    </div>
  `

  return send({ to, subject: `${inviterName} invited you to join ${familyName} on Lumen List`, html })
}

export async function sendConfirmationEmail({
  to,
  name,
  confirmUrl,
}: {
  to: string
  name: string
  confirmUrl: string
}) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Confirm your Lumen List account</h2>
      <p>Hi ${name}, click the button below to confirm your email and start sharing your wishlist.</p>
      <a href="${confirmUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        Confirm your email
      </a>
      <p style="color: #666; font-size: 14px;">If you didn't create this account, you can safely ignore this email.</p>
    </div>
  `

  return send({ to, subject: "Confirm your Lumen List account", html })
}

export async function sendAlreadyRegisteredEmail({
  to,
  resetUrl,
}: {
  to: string
  resetUrl: string
}) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>You already have a Lumen List account</h2>
      <p>Someone (hopefully you) just tried to sign up for Lumen List with this email address, but an account already exists.</p>
      <p>If that was you and you forgot your password, click below to reset it. If you didn't request this, you can safely ignore this email.</p>
      <a href="${resetUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        Reset your password
      </a>
    </div>
  `

  return send({ to, subject: "You already have a Lumen List account", html })
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: {
  to: string
  resetUrl: string
}) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset your Lumen List password</h2>
      <p>Click the button below to choose a new password. This link expires in 1 hour.</p>
      <a href="${resetUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        Reset your password
      </a>
      <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email — your password won't change.</p>
    </div>
  `

  return send({ to, subject: "Reset your Lumen List password", html })
}
