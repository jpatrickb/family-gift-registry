import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GiftTagMotif, LumenIcon, initials, avatarTone } from "@/components/shared/brand"
import { CopyInviteLink } from "@/components/family/copy-invite-link"

type FamilyMemberRow = {
  user_id: string
  role: string
  profiles: { name: string; email: string }
}

type FamilyRow = {
  id: string
  name: string
  created_by: string
  invite_code: string
  created_at: string
  updated_at: string
  family_members: FamilyMemberRow[]
}

type Params = { params: Promise<{ familyId: string }> }

export default async function FamilyPage({ params }: Params) {
  const { familyId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: familyRaw } = await supabase
    .from("families")
    .select("*, family_members(*, profiles(*))")
    .eq("id", familyId)
    .single()
  const family = familyRaw as FamilyRow | null

  if (!family) notFound()

  const isOwner = family.created_by === user.id
  const createdYear = new Date(family.created_at).getFullYear()

  return (
    <div>
      {/* Family header card */}
      <section
        className="ds-card"
        style={{
          padding: "28px 32px",
          marginBottom: 32,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", right: -18, top: -22, opacity: 0.5, pointerEvents: "none" }}>
          <GiftTagMotif size={170} />
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <span className="ds-badge ds-badge-primary">
              <LumenIcon name="users" size={11} strokeWidth={2} />
              Family
            </span>
            <span className="t-meta" style={{ color: "var(--ink-3)", alignSelf: "center" }}>
              Created {createdYear}
            </span>
          </div>
          <h1 className="t-display-sm" style={{ margin: 0 }}>{family.name}</h1>
          <p className="t-body" style={{ marginTop: 8 }}>
            {family.family_members.length} member{family.family_members.length !== 1 ? "s" : ""}
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
            {isOwner && (
              <>
                <Link href={`/families/${familyId}/settings`} className="ds-btn ds-btn-secondary ds-btn-sm">
                  <LumenIcon name="settings" size={13} />
                  Settings
                </Link>
                <CopyInviteLink link={`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/join/${family.invite_code}`} />
              </>
            )}
          </div>
        </div>
      </section>

      {/* Members grid header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 className="t-h2" style={{ margin: 0 }}>Members</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {family.family_members.map((member) => {
          const isCurrentUser = member.user_id === user.id
          const memberName = member.profiles.name || member.profiles.email
          const memberInitials = initials(memberName)
          const tone = avatarTone(member.user_id)

          return (
            <article
              key={member.user_id}
              className="ds-card ds-card-hover"
              style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span className={`ds-avatar ds-avatar-lg ${tone}`}>{memberInitials}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 className="t-h2" style={{ margin: 0, fontSize: 17 }}>
                    {memberName}
                    {isCurrentUser && (
                      <span style={{ color: "var(--ink-3)", fontWeight: 400 }}> (you)</span>
                    )}
                  </h3>
                  {member.role === "owner" && (
                    <div className="t-body-sm" style={{ color: "var(--ink-3)", marginTop: 2 }}>
                      Owner
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  paddingTop: 12,
                  borderTop: "1px solid var(--hairline)",
                }}
              >
                {isCurrentUser ? (
                  <Link href="/gifts" className="ds-btn ds-btn-secondary ds-btn-sm" style={{ width: "100%" }}>
                    Edit my wishlist
                  </Link>
                ) : (
                  <Link
                    href={`/members/${member.user_id}?familyId=${familyId}`}
                    className="ds-btn ds-btn-primary ds-btn-sm"
                    style={{ width: "100%" }}
                  >
                    View {memberName.split(" ")[0]}&apos;s list
                    <LumenIcon name="arrowRight" size={13} />
                  </Link>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
