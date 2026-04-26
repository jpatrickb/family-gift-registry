// Auto-generated placeholder — replace with: npx supabase gen types typescript --project-id <id>
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          updated_at?: string
        }
      }
      families: {
        Row: {
          id: string
          name: string
          created_by: string
          invite_code: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_by: string
          invite_code?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          invite_code?: string
          updated_at?: string
        }
      }
      family_members: {
        Row: {
          id: string
          family_id: string
          user_id: string
          role: "owner" | "member"
          joined_at: string
        }
        Insert: {
          id?: string
          family_id: string
          user_id: string
          role?: "owner" | "member"
          joined_at?: string
        }
        Update: {
          role?: "owner" | "member"
        }
      }
      family_invites: {
        Row: {
          id: string
          family_id: string
          invited_by: string
          email: string
          token: string
          accepted_at: string | null
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          invited_by: string
          email: string
          token?: string
          accepted_at?: string | null
          expires_at?: string
          created_at?: string
        }
        Update: {
          accepted_at?: string | null
        }
      }
      gifts: {
        Row: {
          id: string
          owner_id: string
          family_id: string
          title: string
          description: string | null
          price: number | null
          url: string | null
          image_url: string | null
          sort_order: number
          source: string | null
          external_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          family_id: string
          title: string
          description?: string | null
          price?: number | null
          url?: string | null
          image_url?: string | null
          sort_order?: number
          source?: string | null
          external_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          price?: number | null
          url?: string | null
          image_url?: string | null
          sort_order?: number
          updated_at?: string
        }
      }
      gift_claims: {
        Row: {
          id: string
          gift_id: string
          claimed_by: string
          status: "claimed" | "purchased"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          gift_id: string
          claimed_by: string
          status?: "claimed" | "purchased"
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: "claimed" | "purchased"
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
