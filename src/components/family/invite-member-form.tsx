"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { inviteMemberSchema, type InviteMemberInput } from "@/lib/validations"

export function InviteMemberForm({ familyId }: { familyId: string }) {
  const [loading, setLoading] = useState(false)

  const form = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: "" },
  })

  async function onSubmit(data: InviteMemberInput) {
    setLoading(true)
    const res = await fetch(`/api/families/${familyId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      toast.error("Failed to send invite")
    } else {
      toast.success(`Invite sent to ${data.email}`)
      form.reset()
    }
    setLoading(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel className="sr-only">Email address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="family@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Sending…" : "Send invite"}
        </Button>
      </form>
    </Form>
  )
}
