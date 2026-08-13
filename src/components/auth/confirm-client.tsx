"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export function ConfirmClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    // Signup/recovery links from generateLink() are implicit-flow: tokens
    // arrive in the URL fragment, which never reaches the server, so the
    // session has to be established here, client-side. Wrapped in an async
    // function so every setState (including the guard clauses) happens
    // after a microtask tick, not synchronously within the effect body.
    async function confirm() {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""))
      const accessToken = hash.get("access_token")
      const refreshToken = hash.get("refresh_token")
      const hashError = hash.get("error_description") ?? hash.get("error")
      const next = searchParams.get("next") ?? "/dashboard"

      if (hashError) {
        setErrorMessage(hashError)
        return
      }
      if (!accessToken || !refreshToken) {
        setErrorMessage("This link is invalid or has expired.")
        return
      }

      const { error } = await getSupabaseBrowserClient().auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      if (error) {
        setErrorMessage(error.message)
        return
      }
      router.replace(next)
      router.refresh()
    }
    void confirm()
    // Runs once on mount to process the URL fragment; router/searchParams are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (errorMessage) {
    return (
      <div className="space-y-3 text-center">
        <h1 className="text-xl font-semibold">Link problem</h1>
        <p className="text-sm text-gray-600">{errorMessage}</p>
        <p className="text-sm text-gray-600">
          <a href="/login" className="font-medium underline">
            Back to sign in
          </a>
        </p>
      </div>
    )
  }

  return <p className="text-center text-sm text-gray-600">Confirming…</p>
}
