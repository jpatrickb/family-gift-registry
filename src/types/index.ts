import type { Database } from "./database.types"

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Family = Database["public"]["Tables"]["families"]["Row"]
export type FamilyMember = Database["public"]["Tables"]["family_members"]["Row"]
export type FamilyInvite = Database["public"]["Tables"]["family_invites"]["Row"]
export type Gift = Database["public"]["Tables"]["gifts"]["Row"]
export type GiftClaim = Database["public"]["Tables"]["gift_claims"]["Row"]

export type FamilyMemberWithProfile = FamilyMember & {
  profiles: Profile
}

export type GiftWithClaim = Gift & {
  gift_claims: GiftClaim | null
}

export type FamilyWithMembers = Family & {
  family_members: FamilyMemberWithProfile[]
}
