import { Resend } from "resend"

function getResendClient() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error("RESEND_API_KEY is not set")
  return new Resend(key)
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
      <h2>You're invited to join ${familyName} on Gift Registry</h2>
      <p>${inviterName} has invited you to join their family gift registry.</p>
      <p>Click the button below to accept the invitation and start sharing your wishlist.</p>
      <a href="${inviteUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        Accept Invitation
      </a>
      <p style="color: #666; font-size: 14px;">This invitation expires in 7 days. If you didn't expect this email, you can safely ignore it.</p>
    </div>
  `

  const resend = getResendClient()
  return resend.emails.send({
    from: "Gift Registry <noreply@resend.dev>",
    to,
    subject: `${inviterName} invited you to join ${familyName} on Gift Registry`,
    html,
  })
}
