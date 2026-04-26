"use client"

import { useState } from "react"
import { toast } from "sonner"
import { LumenIcon } from "@/components/shared/brand"

export function CopyInviteLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success("Link copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      className="ds-btn ds-btn-secondary ds-btn-sm"
      onClick={copy}
    >
      <LumenIcon name={copied ? "check" : "copy"} size={13} />
      {copied ? "Copied!" : "Copy invite link"}
    </button>
  )
}
