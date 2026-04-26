"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { KindredIcon } from "@/components/shared/brand"
import type { Gift } from "@/types"
import { giftSchema, type GiftInput } from "@/lib/validations"

interface GiftFormProps {
  families: { id: string; name: string }[]
  gift?: Gift
}

export function GiftForm({ families, gift }: GiftFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [pasteUrl, setPasteUrl] = useState("")
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

  const selectedFamilyId = form.watch("family_id")

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
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Quick-paste URL */}
      {!isEditing && (
        <>
          <div
            className="ds-card"
            style={{
              padding: "10px 10px 10px 18px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <KindredIcon name="link" size={16} style={{ color: "var(--ink-3)", flexShrink: 0 }} />
            <input
              className="ds-input"
              style={{ border: "none", boxShadow: "none", padding: 0, height: 38, background: "transparent", flex: 1 }}
              placeholder="Paste a product URL — e.g. westelm.com/linen-throw"
              value={pasteUrl}
              onChange={(e) => setPasteUrl(e.target.value)}
            />
            <button
              type="button"
              className="ds-btn ds-btn-secondary ds-btn-sm"
              onClick={() => {
                if (pasteUrl.trim()) form.setValue("url", pasteUrl.trim())
              }}
            >
              <KindredIcon name="sparkle" size={13} />
              Auto-fill
            </button>
          </div>
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              margin: "16px 0 24px",
              color: "var(--ink-4)",
              fontSize: 12.5,
            }}
          >
            <div style={{ height: 1, background: "var(--hairline)", flex: 1 }} />
            <span style={{ letterSpacing: "0.06em", fontWeight: 500 }}>OR ENTER MANUALLY</span>
            <div style={{ height: 1, background: "var(--hairline)", flex: 1 }} />
          </div>
        </>
      )}

      <div style={{ display: "grid", gap: 18 }}>
        {/* Family selector */}
        <div>
          <label className="ds-label">Which family is this for?</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {families.map((f) => {
              const isSelected = selectedFamilyId === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => form.setValue("family_id", f.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "8px 14px",
                    borderRadius: 999,
                    fontFamily: "inherit",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    border: "1px solid",
                    background: isSelected ? "var(--primary-soft)" : "var(--surface)",
                    borderColor: isSelected ? "oklch(0.78 0.10 285)" : "var(--hairline-strong)",
                    color: isSelected ? "oklch(0.36 0.16 285)" : "var(--ink-2)",
                    transition: "all 120ms ease",
                  }}
                >
                  {isSelected && <KindredIcon name="check" size={13} />}
                  {f.name}
                </button>
              )
            })}
          </div>
          <p className="ds-help">Only members of this family will see it.</p>
          {form.formState.errors.family_id && (
            <p className="ds-help" style={{ color: "var(--destructive)" }}>
              {form.formState.errors.family_id.message}
            </p>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="ds-label">Title</label>
          <input
            className="ds-input"
            placeholder="e.g. Blue knit sweater"
            {...form.register("title")}
          />
          {form.formState.errors.title && (
            <p className="ds-help" style={{ color: "var(--destructive)" }}>
              {form.formState.errors.title.message}
            </p>
          )}
        </div>

        {/* Link + Price */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 16 }}>
          <div>
            <label className="ds-label">
              Link <span style={{ color: "var(--ink-4)", fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              className="ds-input"
              type="url"
              placeholder="https://…"
              {...form.register("url")}
            />
          </div>
          <div>
            <label className="ds-label">
              Price <span style={{ color: "var(--ink-4)", fontWeight: 400 }}>(optional)</span>
            </label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--ink-3)",
                  fontSize: 14,
                  pointerEvents: "none",
                }}
              >
                $
              </span>
              <input
                className="ds-input"
                placeholder="49.99"
                style={{ paddingLeft: 24 }}
                {...form.register("price")}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="ds-label">
            Notes <span style={{ color: "var(--ink-4)", fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            className="ds-textarea"
            placeholder="Size, color, brand notes — anything that helps."
            {...form.register("description")}
          />
          <p className="ds-help">These notes help family members pick the right version.</p>
        </div>

        {/* Image URL */}
        <div>
          <label className="ds-label">
            Image URL <span style={{ color: "var(--ink-4)", fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            className="ds-input"
            type="url"
            placeholder="https://…"
            {...form.register("image_url")}
          />
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 4,
            paddingTop: 20,
            borderTop: "1px solid var(--hairline)",
          }}
        >
          <button
            type="button"
            className="ds-btn ds-btn-ghost"
            onClick={() => router.back()}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="ds-btn ds-btn-primary"
            disabled={loading}
          >
            <KindredIcon name="plus" size={14} />
            {loading ? "Saving…" : isEditing ? "Save changes" : "Add to wishlist"}
          </button>
        </div>
      </div>
    </form>
  )
}
