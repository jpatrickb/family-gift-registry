import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Nav } from "@/components/shared/nav"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--background)" }}>
      <Nav userId={user.id} />
      <main
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "36px 28px 64px",
          width: "100%",
          flex: 1,
        }}
      >
        {children}
      </main>
    </div>
  )
}
