# Codebase documentation

_Updated whenever changes are made to the app. Agents: keep this current._

---

## What this app does

Families share gift wishlists. Members can claim gifts on behalf of one another so purchases aren't duplicated. The gift owner never sees who claimed or bought their gifts — this "surprise preservation" is enforced at the Postgres RLS layer, not just the UI.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15, App Router, TypeScript |
| Database + Auth | Supabase (Postgres, RLS, email/password auth) |
| Email | Resend (direct invites) + Supabase Auth via custom SMTP |
| UI | TailwindCSS, shadcn/ui v4 (Base UI primitives) |
| Hosting | Vercel |

---

## Database schema

All tables live in the `public` schema. RLS is enabled on every table.

### `profiles`
Auto-created on signup via the `handle_new_user` trigger. Mirrors `auth.users`.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | FK → auth.users |
| email | text | |
| name | text | from signup metadata |
| avatar_url | text | nullable |

### `families`
A family group. One user creates it and becomes the owner.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | |
| created_by | uuid | FK → profiles |
| invite_code | text | unique 12-char code for shareable links |

The `handle_family_created` trigger inserts a `family_members` row with `role = 'owner'` on insert.

### `family_members`
Junction table. A user can belong to multiple families.

| Column | Type | Notes |
|---|---|---|
| family_id | uuid | FK → families |
| user_id | uuid | FK → profiles |
| role | text | `'owner'` or `'member'` |

### `family_invites`
Tracks email-based invitations. Tokens are UUID-derived, expire after 7 days.

| Column | Type | Notes |
|---|---|---|
| family_id | uuid | |
| invited_by | uuid | |
| email | text | |
| token | text | unique, used in invite URL |
| accepted_at | timestamptz | null until accepted |
| expires_at | timestamptz | now + 7 days |

### `gifts`
A gift on someone's wishlist. Scoped to a specific family.

| Column | Type | Notes |
|---|---|---|
| owner_id | uuid | the person who wants this gift |
| family_id | uuid | which family's wishlist it appears on |
| title | text | |
| description | text | nullable |
| price | numeric | nullable |
| url | text | nullable |
| image_url | text | nullable |
| source | text | `'manual'` now; reserved for `'chrome_extension'`, `'google_sheets'` |
| external_id | text | reserved for future integrations |

### `gift_claims`
Records who is buying a gift. The one-row-per-gift UNIQUE constraint prevents double-claiming.

| Column | Type | Notes |
|---|---|---|
| gift_id | uuid UNIQUE | |
| claimed_by | uuid | |
| status | text | `'claimed'` or `'purchased'` |

**Critical RLS policy** — SELECT: a user can see a claim row if they claimed it themselves, OR if they are a family member of the gift's family AND the gift owner is not them. This means owners are blind to their own gift claims at the database level.

---

## Route structure

```
/                        → redirects to /dashboard or /login
/login                   → email/password sign in
/signup                  → create account
/dashboard               → family list + own wishlist summary
/families                → list all families for the current user
/families/new            → create a family
/families/[familyId]     → family hub: member cards, links to wishlists
/families/[familyId]/settings  → invite by email, copy shareable link
/gifts                   → manage your own wishlist (no claim data shown)
/gifts/new               → add a gift
/gifts/[giftId]/edit     → edit a gift
/members/[userId]        → view another member's wishlist; claim gifts
/invite/[token]          → email invite acceptance (no auth gate)
/join/[inviteCode]       → shareable link acceptance (no auth gate)
/account                 → user profile
```

Route groups:
- `(auth)/` — unauthenticated pages, no nav
- `(app)/` — auth-gated pages; `layout.tsx` redirects to `/login` if no session

`/invite/[token]` and `/join/[inviteCode]` sit outside `(app)/` so unauthenticated users land on the page first, then are sent to login/signup with `?next=` redirect param.

---

## API routes

| Route | Methods | Notes |
|---|---|---|
| `/api/auth/callback` | GET | Supabase PKCE callback |
| `/api/families` | POST | create family |
| `/api/families/[familyId]` | GET, PATCH, DELETE | |
| `/api/families/[familyId]/invite` | POST | send Resend email invite |
| `/api/families/[familyId]/members` | GET, DELETE | list or remove members |
| `/api/gifts` | GET, POST | GET supports `?userId=` and `?familyId=` params |
| `/api/gifts/[giftId]` | GET, PATCH, DELETE | |
| `/api/gifts/[giftId]/claim` | POST, PATCH, DELETE | claim/unclaim/mark purchased |
| `/api/invite/[token]` | POST | accept email invite (uses admin client) |
| `/api/join/[inviteCode]` | POST | accept shareable link (uses admin client) |

---

## Key files

| File | Purpose |
|---|---|
| `middleware.ts` | Session refresh + auth redirect for all routes |
| `src/lib/supabase/middleware.ts` | Protects authenticated route prefixes while allowing unknown paths to render 404 UI |
| `src/lib/supabase/server.ts` | Supabase client for Server Components / Route Handlers |
| `src/lib/supabase/client.ts` | Supabase client for Client Components (singleton) |
| `src/lib/supabase/admin.ts` | Service role client — bypasses RLS; server-only |
| `src/lib/supabase/middleware.ts` | Supabase client for middleware (reads/writes cookies on req/res) |
| `src/lib/resend.ts` | Resend email sender |
| `src/lib/validations.ts` | Zod schemas for all forms |
| `src/components/dashboard/dashboard-greeting.tsx` | Client-side local-time greeting for dashboard hero |
| `src/types/database.types.ts` | **Generated** — run `npx supabase gen types typescript` after schema changes |
| `src/types/index.ts` | Type aliases (`Gift`, `Profile`, etc.) |
| `supabase/migrations/0001_initial_schema.sql` | Full DB schema, RLS policies, triggers |
| `supabase/migrations/0002_fix_family_members_rls_recursion.sql` | Replaces recursive `family_members` select policy with a SECURITY DEFINER membership helper |
| `supabase/migrations/0003_create_family_rpc.sql` | Adds `create_family(text)` SECURITY DEFINER RPC for reliable family creation under RLS |
| `supabase/migrations/0004_backfill_profiles_and_harden_create_family.sql` | Backfills missing `profiles` rows from `auth.users` and ensures `create_family()` creates caller profile before inserting family |

---

## Design decisions

**Why gifts are family-scoped**: A user in multiple families (e.g., own family + in-laws) maintains separate wishlists per family. This keeps family data isolated — in-laws don't see the other family's list.

**Why the admin client is used for invite acceptance**: Invite tokens are validated by the service role to bypass RLS. The normal user client can't look up an invite by token without already being authenticated as the invitee, which creates a chicken-and-egg problem for new users.

**Why join codes are normalized**: `/join/[inviteCode]` now trims and lowercases codes before lookup and uses case-insensitive matching. This prevents false "invalid link" states when shared codes are copied with casing differences.

**Why shadcn/ui v4 components don't support `asChild`**: v4 uses Base UI primitives instead of Radix UI. The `Button` component was replaced with a Radix-based implementation to restore `asChild` support. The `DropdownMenu` trigger and items use `onClick` + `router.push()` for navigation instead.

**Why `as any` casts exist in API routes**: The hand-written `database.types.ts` placeholder didn't fully satisfy supabase-js v2 type inference. These casts are in API route files only. Now that real generated types are in place they're safe to remove incrementally.

**Why dashboard greeting is client-rendered**: The greeting period (morning/afternoon/evening) is computed in a Client Component so it reflects the viewer's local time rather than the server timezone.

**Why `is_family_member()` exists**: querying `family_members` inside the `family_members` SELECT policy caused PostgreSQL RLS recursion (`infinite recursion detected in policy for relation "family_members"`). The SECURITY DEFINER helper lets policies check membership without recursive policy evaluation.

**Why `/api/families` calls `create_family()`**: creating a family with `insert(...).select().single()` can fail under RLS because the immediate read-back depends on membership visibility timing. The RPC creates the family and owner membership in one privileged function and returns the new `family_id` directly.

**Why `create_family()` now upserts `profiles`**: older users can exist in `auth.users` without a corresponding `public.profiles` row, which causes `families.created_by` foreign-key failures. The function now guarantees the caller profile exists before inserting a family.

---

## Environment variables

| Variable | Used by |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | All Supabase clients |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser + server clients |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin client (invite acceptance routes) |
| `RESEND_API_KEY` | Email invite sending |
| `RESEND_FROM_EMAIL` | Resend sender identity for app emails |
| `NEXT_PUBLIC_APP_URL` | Invite link generation |
| `AUTH_DEBUG` | Optional server-side auth/invite diagnostics in logs |

---

## Testing

End-to-end test plan: [`tests/test-plan.md`](./tests/test-plan.md)

Manual execution issue tracker: [`tests/test-issues.md`](./tests/test-issues.md)

Covers 8 sections across ~35 scenarios: auth, family management, invite flows, gift CRUD, gift claiming (including surprise-preservation verification), multi-family RLS isolation, navigation, and edge cases. Designed for execution by an AI agent using Playwright MCP tools. No automated test runner is wired up yet — tests are run on demand by sending an agent to `tests/test-plan.md`.

---

## Planned / future features

- Chrome extension to scrape gift details from product pages (schema has `source` and `external_id` columns ready)
- Google Sheets sync (same columns)
