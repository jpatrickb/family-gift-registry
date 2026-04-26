import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ClaimButton } from "./claim-button"
import { DeleteGiftButton } from "./delete-gift-button"
import type { GiftWithClaim, Gift } from "@/types"

interface GiftCardProps {
  gift: GiftWithClaim | Gift
  isOwner: boolean
  showClaimStatus?: boolean
}

export function GiftCard({ gift, isOwner, showClaimStatus = false }: GiftCardProps) {
  const claim = showClaimStatus && "gift_claims" in gift ? gift.gift_claims : null
  const isClaimed = !!claim
  const isPurchased = claim?.status === "purchased"

  return (
    <Card className={isClaimed ? "opacity-75" : ""}>
      {gift.image_url && (
        <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
          <Image
            src={gift.image_url}
            alt={gift.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{gift.title}</h3>
            {gift.price && (
              <p className="text-sm text-gray-600">
                ${gift.price.toFixed(2)}
              </p>
            )}
          </div>
          {showClaimStatus && (
            <div>
              {isPurchased ? (
                <Badge variant="default">Purchased</Badge>
              ) : isClaimed ? (
                <Badge variant="secondary">Claimed</Badge>
              ) : (
                <Badge variant="outline">Available</Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {gift.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{gift.description}</p>
        )}
        {gift.url && (
          <a
            href={gift.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline truncate block"
          >
            View item →
          </a>
        )}
        <div className="flex gap-2">
          {isOwner ? (
            <>
              <Link
                href={`/gifts/${gift.id}/edit`}
                className="text-sm text-gray-500 hover:text-gray-900 underline"
              >
                Edit
              </Link>
              <DeleteGiftButton giftId={gift.id} />
            </>
          ) : (
            showClaimStatus && (
              <ClaimButton
                giftId={gift.id}
                claim={claim}
              />
            )
          )}
        </div>
      </CardContent>
    </Card>
  )
}
