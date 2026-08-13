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
| Email | Resend only — app code calls Resend's API directly for every user-facing email (invites, signup confirmation, password reset). Supabase Auth's built-in mailer is not used by any app flow; its SMTP relay is still configured (pointed at Resend) as a safety net for any future built-in Supabase email (e.g. email-change confirmation), but nothing currently triggers it. |
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
A gift on someone's personal wishlist (not scoped to a single family — visible to anyone who shares any family with the owner; see design decision below).

| Column | Type | Notes |
|---|---|---|
| owner_id | uuid | the person who wants this gift |
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
/forgot-password         → request a password-reset email
/reset-password          → set a new password (reached via reset-email link; requires an active session)
/confirm                 → client-side handler for signup/recovery links (see design decision below)
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
| `/api/auth/signup` | POST | Creates the user via the admin client and sends a Resend confirmation email. Returns the same generic response whether the email is new or already registered (anti-enumeration) — a repeat signup instead gets an "already have an account" email with a password-reset link. |
| `/api/auth/forgot-password` | POST | Generates a recovery link via the admin client and sends it via Resend. Always returns the same generic response regardless of whether the email is registered. |
| `/api/families` | POST | create family |
| `/api/families/[familyId]` | GET, PATCH, DELETE | |
| `/api/families/[familyId]/invite` | POST | send Resend email invite |
| `/api/families/[familyId]/members` | GET, DELETE | list or remove members |
| `/api/gifts` | GET, POST | GET supports `?userId=` |
| `/api/gifts/scrape` | POST | Server-side scrape of a product URL → `{ title, image_url, price, description }` (auth-gated, SSRF-guarded) |
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
| `src/lib/resend.ts` | Resend email sender — invite, signup confirmation, already-registered notice, password reset. All sends go through a shared `send()` helper that throws on failure (Resend's SDK returns `{data,error}` rather than throwing, so callers must check) |
| `src/lib/scrape.ts` | Server-only product-page scraper: SSRF guard + Open Graph/Twitter/meta-tag extraction via `cheerio` |
| `src/lib/validations.ts` | Zod schemas for all forms |
| `src/components/auth/confirm-client.tsx` | Client component behind `/confirm` — parses the implicit-flow tokens out of the URL fragment and calls `setSession()` |
| `src/components/auth/forgot-password-form.tsx` | Form for `/forgot-password` |
| `src/components/auth/reset-password-form.tsx` | Form for `/reset-password`; calls `supabase.auth.updateUser({password})` on the session established via `/confirm` |
| `src/components/dashboard/dashboard-greeting.tsx` | Client-side local-time greeting for dashboard hero |
| `src/types/database.types.ts` | **Generated** — run `npx supabase gen types typescript` after schema changes |
| `src/types/index.ts` | Type aliases (`Gift`, `Profile`, etc.) |
| `supabase/migrations/0001_initial_schema.sql` | Full DB schema, RLS policies, triggers |
| `supabase/migrations/0002_fix_family_members_rls_recursion.sql` | Replaces recursive `family_members` select policy with a SECURITY DEFINER membership helper |
| `supabase/migrations/0003_create_family_rpc.sql` | Adds `create_family(text)` SECURITY DEFINER RPC for reliable family creation under RLS |
| `supabase/migrations/0004_backfill_profiles_and_harden_create_family.sql` | Backfills missing `profiles` rows from `auth.users` and ensures `create_family()` creates caller profile before inserting family |
| `supabase/migrations/0005_personal_wishlists.sql` | Drops `gifts.family_id`; rebuilds `gifts`/`gift_claims` RLS to use shared family membership instead |

---

## Design decisions

**Why gifts are personal, not family-scoped**: Each gift belongs to its owner, not to one family. A user in multiple families (e.g. own family + in-laws) shares the same wishlist with all of them — one list per person, not one per family pairing. Visibility and the surprise-preservation guarantee are enforced at the RLS layer via shared `family_members` rows between the viewer and the owner (see `0005_personal_wishlists.sql`), not via a `family_id` column on `gifts`.

**Why signup/password-reset emails are sent by the app via Resend, not Supabase's built-in mailer**: Keeps every user-facing email on one provider/template system (matching how family invites already worked) instead of splitting delivery between Resend (invites) and Supabase's SMTP-relayed mailer (auth emails) with separate, differently-styled templates. The app calls `supabase.auth.admin.generateLink()` (service role, in `/api/auth/signup` and `/api/auth/forgot-password`) to create the user / generate the link without Supabase auto-sending anything, then sends that link itself via `src/lib/resend.ts`.

**Why `/confirm` exists and isn't just `/api/auth/callback` doing a code exchange**: `generateLink()` runs server-side with no browser present, so Supabase can't issue a PKCE `code` (that requires a code_verifier stored client-side at signup time). It instead produces an implicit-flow link whose `access_token`/`refresh_token` arrive in the URL **fragment** — which never reaches a server, since fragments aren't sent in HTTP requests. `/confirm` (`src/components/auth/confirm-client.tsx`) is a client component that reads `window.location.hash` and calls `supabase.auth.setSession()` directly in the browser. There is no server-side auth callback route in this app anymore.

**Why signup and forgot-password always return the same generic response**: Anti-enumeration. A signup for an already-registered email, or a password-reset request for a nonexistent one, must look identical over the API to a genuine new signup/reset — otherwise the response itself would reveal whether an email is registered. The difference is only visible over email: a repeat signup gets an "already have an account" message with a reset link instead of a confirmation link; a reset request for a nonexistent email sends nothing at all.

**Why the admin client is used for invite acceptance**: Invite tokens are validated by the service role to bypass RLS. The normal user client can't look up an invite by token without already being authenticated as the invitee, which creates a chicken-and-egg problem for new users.

**Why join codes are normalized**: `/join/[inviteCode]` now trims and lowercases codes before lookup and uses case-insensitive matching. This prevents false "invalid link" states when shared codes are copied with casing differences.

**Why shadcn/ui v4 components don't support `asChild`**: v4 uses Base UI primitives instead of Radix UI. The `Button` component was replaced with a Radix-based implementation to restore `asChild` support. The `DropdownMenu` trigger and items use `onClick` + `router.push()` for navigation instead.

**Why `as any` casts exist in API routes**: The hand-written `database.types.ts` placeholder didn't fully satisfy supabase-js v2 type inference. These casts are in API route files only. Now that real generated types are in place they're safe to remove incrementally.

**Why dashboard greeting is client-rendered**: The greeting period (morning/afternoon/evening) is computed in a Client Component so it reflects the viewer's local time rather than the server timezone.

**Why URL scraping runs server-side**: The "Auto-fill" bar on the add-gift form posts the pasted URL to `/api/gifts/scrape`, which fetches the page server-side (browser fetches are CORS-blocked on most retail sites) and extracts details with `cheerio`. The route guards against SSRF by resolving the hostname and rejecting loopback/private/link-local/cloud-metadata addresses, and caps fetch time (8s) and body size (2 MB).

**Scraper extraction chain** (`scrapeGift`): sources are tried in priority order and the first hit wins, so coverage degrades gracefully:
1. **Site-specific** — Amazon DOM extraction (see below).
2. **JSON-LD** (`schema.org/Product`) — the web standard retailers embed for Google rich results. Yields a clean name, image, price, and description in one shot, and is often the *only* place a price is exposed (e.g. Uncommon Goods). Parsed from all `<script type="application/ld+json">` blocks, walking `@graph` and arrays; malformed blocks are ignored.
3. **Open Graph / Twitter / standard meta tags** — name, image, description, and `product:price:amount`.
4. **`<title>` / `<h1>`** — last-resort title.

Scraping is best-effort. Empirically, common sites fall into three buckets: (a) good structured data → name+image+price work; (b) reachable but JS-rendered (Nike, Allbirds, Target) → name+image only, price is JS-loaded and absent from initial HTML; (c) **hard-blocked** (Etsy, REI, West Elm, Best Buy, etc.) → return 403/429/503 to datacenter-IP requests regardless of User-Agent, so nothing is extracted. In every partial/failure case the form falls back to manual entry (the pasted link is still saved). Defeating bucket (c) or getting price from bucket (b) would require a headless browser and/or residential-IP proxy or a paid scraping API — deliberately out of scope. Scraped descriptions are capped at 1000 chars to satisfy the gift form's validation.

**Why Amazon has a dedicated extractor**: Amazon is the most common source, but its product pages ship generic/empty Open Graph tags ("Amazon" title, logo image) while the real data lives in the DOM. `scrapeGift` detects Amazon hosts (`amazon.*`, `amzn.*`, matched against the post-redirect host so `amzn.to` short links work) and reads the title from `#productTitle` and the image from `#landingImage`'s `data-old-hires` / `data-a-dynamic-image` (largest variant). These site-specific values take priority over the generic meta-tag fallback. **Amazon price is not scrapable** from the initial HTML — it's lazy-loaded via a later AJAX call — so price comes back empty on Amazon and the user enters it manually. Server-side fetches with our bot User-Agent currently receive the full product page (not the captcha variant); if that changes, title/image will degrade to empty and fall back to manual entry.

**Why `images.unoptimized` is set**: Scraped product images come from arbitrary retailer domains that can't be predicted, so a `remotePatterns` allowlist would be too brittle. `next.config.ts` sets `images.unoptimized: true` so `next/image` serves any external image as-is (Next otherwise `400`s images from unconfigured hosts). Trade-off: Next's image optimizer/proxy is skipped for all images.

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

- Chrome extension to scrape gift details from product pages (schema has `source` and `external_id` columns ready). Note: server-side URL scraping now exists via `/api/gifts/scrape` (see "Why URL scraping runs server-side"); a Chrome extension would still help on sites that block server-side fetches.
- Google Sheets sync (same columns)
