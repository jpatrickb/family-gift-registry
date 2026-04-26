"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function CopyInviteLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success("Link copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex gap-2">
      <Input value={link} readOnly className="flex-1 text-sm" />
      <Button variant="outline" onClick={copy}>
        {copied ? "Copied!" : "Copy"}
      </Button>
    </div>
  )
}
