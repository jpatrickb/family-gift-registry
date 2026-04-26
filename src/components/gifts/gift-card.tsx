import Link from "next/link"
import Image from "next/image"
import { LumenIcon } from "@/components/shared/brand"
import { ClaimButton } from "./claim-button"
import { DeleteGiftButton } from "./delete-gift-button"
import type { GiftWithClaim, Gift } from "@/types"

interface GiftCardProps {
  gift: GiftWithClaim | Gift
  isOwner: boolean
  showClaimStatus?: boolean
  currentUserId?: string
}

export function GiftCard({ gift, isOwner, showClaimStatus = false, currentUserId }: GiftCardProps) {
  const claim = showClaimStatus && "gift_claims" in gift ? gift.gift_claims : null
  const isClaimed = !!claim
  const isPurchased = claim?.status === "purchased"
  const isMyClaim = !!claim && !!currentUserId && claim.claimed_by === currentUserId

  const domain = gift.url
    ? (() => {
        try {
          return new URL(gift.url).hostname.replace("www.", "")
        } catch {
          return gift.url
        }
      })()
    : null

  if (showClaimStatus) {
    // Horizontal card layout for viewing others' wishlists
    return (
      <article
        className="ds-card"
        style={{
          padding: 0,
          overflow: "hidden",
          opacity: isPurchased ? 0.92 : 1,
          borderColor: isPurchased
            ? "oklch(0.88 0.06 80)"
            : isMyClaim && isClaimed
            ? "oklch(0.85 0.05 285)"
            : "var(--hairline)",
          background: isPurchased
            ? "linear-gradient(180deg, var(--accent-amber-soft) 0%, var(--surface) 60%)"
            : "var(--surface)",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr" }}>
          {gift.image_url ? (
            <div style={{ position: "relative", overflow: "hidden", borderRight: "1px solid var(--hairline)" }}>
              <Image src={gift.image_url} alt={gift.title} fill style={{ objectFit: "cover" }} />
            </div>
          ) : (
            <div
              className="ds-img-placeholder"
              style={{ borderRight: "1px solid var(--hairline)", borderBottom: "none", minHeight: 120 }}
            >
              <LumenIcon name="gift" size={18} style={{ opacity: 0.3 }} />
            </div>
          )}
          <div
            style={{
              padding: "16px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              minWidth: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 className="t-h3" style={{ margin: 0, fontSize: 15 }}>
                  {gift.title}
                </h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
                  {gift.price && (
                    <span style={{ fontFamily: "var(--font-display, Georgia, serif)", fontSize: 17, color: "var(--ink)" }}>
                      ${gift.price}
                    </span>
                  )}
                  {domain && (
                    <a
                      href={gift.url ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 12.5,
                        color: "var(--ink-3)",
                        textDecoration: "none",
                        fontWeight: 500,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      {domain}
                      <LumenIcon name="external" size={11} />
                    </a>
                  )}
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                {isPurchased ? (
                  <span className="ds-badge ds-badge-accent">
                    <LumenIcon name="checkCircle" size={11} strokeWidth={2} />
                    Purchased
                  </span>
                ) : isClaimed ? (
                  <span className="ds-badge ds-badge-primary">
                    <LumenIcon name="shoppingBag" size={11} strokeWidth={2} />
                    Claimed
                  </span>
                ) : (
                  <span className="ds-badge ds-badge-outline">
                    <span className="ds-badge-dot" />
                    Available
                  </span>
                )}
              </div>
            </div>

            {gift.description && (
              <p className="t-body-sm" style={{ margin: 0, color: "var(--ink-3)" }}>
                {gift.description}
              </p>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
              {isClaimed && !isMyClaim ? (
                <span className="t-meta" style={{ color: "var(--ink-3)" }}>
                  Reserved by someone
                </span>
              ) : (
                <span />
              )}
              <ClaimButton
                giftId={gift.id}
                claim={claim}
                isMyClaim={isMyClaim}
              />
            </div>
          </div>
        </div>
      </article>
    )
  }

  // Vertical card layout for owner's wishlist
  return (
    <article
      className="ds-card ds-card-hover"
      style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      {gift.image_url ? (
        <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 3", overflow: "hidden" }}>
          <Image src={gift.image_url} alt={gift.title} fill style={{ objectFit: "cover" }} />
        </div>
      ) : (
        <div className="ds-img-placeholder" style={{ aspectRatio: "4 / 3" }}>
          <LumenIcon name="gift" size={20} style={{ opacity: 0.3 }} />
        </div>
      )}

      <div
        style={{
          padding: "16px 18px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          flex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <h3 className="t-h3" style={{ margin: 0, fontSize: 15, flex: 1, minWidth: 0 }}>
            {gift.title}
          </h3>
          {gift.price && (
            <span
              style={{
                fontFamily: "var(--font-display, Georgia, serif)",
                fontSize: 18,
                color: "var(--ink)",
                flexShrink: 0,
                marginLeft: 8,
              }}
            >
              ${gift.price}
            </span>
          )}
        </div>

        {gift.description && (
          <p className="t-body-sm" style={{ margin: 0, color: "var(--ink-3)" }}>
            {gift.description}
          </p>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
            paddingTop: 6,
          }}
        >
          {domain ? (
            <a
              href={gift.url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 12.5,
                color: "var(--ink-3)",
                textDecoration: "none",
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {domain}
              <LumenIcon name="external" size={11} />
            </a>
          ) : (
            <span />
          )}

          {isOwner && (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Link
                href={`/gifts/${gift.id}/edit`}
                style={{
                  fontSize: 12.5,
                  color: "var(--ink-3)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <LumenIcon name="pencil" size={12} />
                Edit
              </Link>
              <DeleteGiftButton giftId={gift.id} />
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
