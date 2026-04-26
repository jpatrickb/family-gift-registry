"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { createFamilySchema, type CreateFamilyInput } from "@/lib/validations"

export function CreateFamilyForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<CreateFamilyInput>({
    resolver: zodResolver(createFamilySchema),
    defaultValues: { name: "" },
  })

  async function onSubmit(data: CreateFamilyInput) {
    setLoading(true)
    const res = await fetch("/api/families", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) {
      toast.error("Failed to create family")
      setLoading(false)
      return
    }
    router.push(`/families/${json.family.id}`)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Family name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. The Beal Family" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Creating…" : "Create family"}
        </Button>
      </form>
    </Form>
  )
}
