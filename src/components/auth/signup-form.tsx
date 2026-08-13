"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
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
import { signupSchema, type SignupInput } from "@/lib/validations"

export function SignupForm() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  })

  async function onSubmit(data: SignupInput) {
    setLoading(true)
    setSubmitError(null)
    const next = searchParams.get("next") ?? "/dashboard"
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, next }),
    })
    const json = await res.json().catch(() => ({}))

    if (!res.ok) {
      const message = json.error ?? "Something went wrong. Please try again."
      toast.error(message)
      setSubmitError(message)
      setLoading(false)
      return
    }

    setSubmittedEmail(data.email)
    setLoading(false)
  }

  if (submittedEmail) {
    return (
      <div className="space-y-3 text-center">
        <h2 className="text-xl font-semibold">Check your email</h2>
        <p className="text-sm text-gray-600">
          We sent a confirmation link to <strong>{submittedEmail}</strong>. Click it to finish
          creating your account, then come back and sign in.
        </p>
        <p className="text-sm text-gray-600">
          Didn&apos;t get it? Check spam, or{" "}
          <button
            type="button"
            className="font-medium underline"
            onClick={() => setSubmittedEmail(null)}
          >
            try again
          </button>
          .
        </p>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
        {submitError && (
          <p className="text-sm text-red-600" role="alert">
            {submitError}
          </p>
        )}
      </form>
    </Form>
  )
}
