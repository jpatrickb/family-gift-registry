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
import type { Gift } from "@/types"
import { giftSchema, type GiftInput } from "@/lib/validations"

interface GiftFormProps {
  families: { id: string; name: string }[]
  gift?: Gift
}

export function GiftForm({ families, gift }: GiftFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isEditing = !!gift

  const form = useForm<GiftInput>({
    resolver: zodResolver(giftSchema),
    defaultValues: {
      title: gift?.title ?? "",
      description: gift?.description ?? "",
      price: gift?.price?.toString() ?? "",
      url: gift?.url ?? "",
      image_url: gift?.image_url ?? "",
      family_id: gift?.family_id ?? families[0]?.id ?? "",
    },
  })

  async function onSubmit(data: GiftInput) {
    setLoading(true)
    const url = isEditing ? `/api/gifts/${gift.id}` : "/api/gifts"
    const method = isEditing ? "PATCH" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      toast.error("Failed to save gift")
      setLoading(false)
      return
    }

    toast.success(isEditing ? "Gift updated" : "Gift added to your wishlist")
    router.push("/gifts")
    router.refresh()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="family_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Family</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {families.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Blue knit sweater" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Size, color, notes…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (optional)</FormLabel>
              <FormControl>
                <Input type="text" placeholder="49.99" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link (optional)</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL (optional)</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : isEditing ? "Save changes" : "Add gift"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
