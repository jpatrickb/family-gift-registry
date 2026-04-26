import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GiftForm } from "@/components/gifts/gift-form"

export default async function NewGiftPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: families } = await supabase
    .from("families")
    .select("id, name, family_members!inner(user_id)")
    .eq("family_members.user_id", user.id)

  if (!families || families.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <h1 className="text-xl font-semibold">Join a family first</h1>
        <p className="text-gray-600 mt-2">
          You need to be part of a family group to add gifts.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Add a gift</h1>
      <GiftForm families={families} />
    </div>
  )
}
