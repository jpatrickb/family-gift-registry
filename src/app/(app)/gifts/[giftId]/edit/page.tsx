import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GiftForm } from "@/components/gifts/gift-form"

type Params = { params: Promise<{ giftId: string }> }

export default async function EditGiftPage({ params }: Params) {
  const { giftId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [{ data: gift }, { data: families }] = await Promise.all([
    supabase.from("gifts").select("*").eq("id", giftId).eq("owner_id", user.id).single(),
    supabase
      .from("families")
      .select("id, name, family_members!inner(user_id)")
      .eq("family_members.user_id", user.id),
  ])

  if (!gift) notFound()

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Edit gift</h1>
      <GiftForm families={families ?? []} gift={gift} />
    </div>
  )
}
