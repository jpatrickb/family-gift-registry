# Lumen — End-to-End Test Plan

**App URL:** https://family-gift-registry-zeta.vercel.app  
**Agent tool:** Use Playwright MCP (`mcp__plugin_playwright_playwright__*`) to execute each test.  
**On failure:** Record the exact URL, visible text, and what differed from the expected outcome. Continue to the next test unless a failure makes subsequent tests impossible (e.g. login broken).

---

## Setup: test accounts

Before running tests, you need two accounts in Supabase so multi-user scenarios work.

**Account A (primary tester)**
- Email: `jpatrickbeall@gmail.com`
- Password: `TestPassword1!`

**Account B (second family member)**
- Email: `patrickbeal@techforceadvisors.com`
- Password: `TestPassword1!`

If either account does not exist yet, create it by running the signup flow (see T-AUTH-02 / T-AUTH-03) before proceeding. These accounts are reused across all tests, so only create them once.

---

## Section 1 — Authentication

### T-AUTH-01 · Unauthenticated redirect
**Given** the user is not logged in  
**Steps**
1. Navigate to `https://family-gift-registry-zeta.vercel.app/dashboard`

**Expected**
- Redirected to `/login`
- Login page is visible with email and password fields

---

### T-AUTH-02 · Sign up (Account A)
**Steps**
1. Navigate to `/signup`
2. Enter name: `Test User A`
3. Enter email: `test-a@Lumen-test.dev`
4. Enter password: `TestPassword1!`
5. Submit the form

**Expected**
- Redirected to `/dashboard`
- Page shows a greeting ("Good morning/afternoon/evening, Test")
- No error messages visible

---

### T-AUTH-03 · Sign up (Account B)
**Steps**
1. Sign out if currently logged in (via user menu → Sign out)
2. Navigate to `/signup`
3. Enter name: `Test User B`
4. Enter email: `test-b@Lumen-test.dev`
5. Enter password: `TestPassword1!`
6. Submit

**Expected**
- Redirected to `/dashboard`

---

### T-AUTH-04 · Login
**Steps**
1. Sign out if logged in
2. Navigate to `/login`
3. Enter email: `test-a@Lumen-test.dev`, password: `TestPassword1!`
4. Submit

**Expected**
- Redirected to `/dashboard`
- User menu avatar visible in the nav

---

### T-AUTH-05 · Login with wrong password
**Steps**
1. Navigate to `/login`
2. Enter email: `test-a@Lumen-test.dev`, password: `WrongPassword!`
3. Submit

**Expected**
- Stays on `/login`
- Error toast or inline error is visible
- No redirect

---

### T-AUTH-06 · Logout
**Steps**
1. Log in as Account A
2. Click the avatar in the top-right nav
3. Click "Sign out"

**Expected**
- Redirected to `/login`
- Navigating to `/dashboard` redirects back to `/login`

---

### T-AUTH-07 · Login redirect preserves destination
**Steps**
1. Sign out
2. Navigate directly to `/gifts`

**Expected**
- Redirected to `/login?next=/gifts` (or similar)
3. Log in as Account A

**Expected**
- Redirected back to `/gifts`, not to `/dashboard`

---

## Section 2 — Family management

_Run these as Account A unless stated otherwise._

### T-FAM-01 · Create a family
**Steps**
1. Log in as Account A
2. Navigate to `/families/new`
3. Enter family name: `Beal Family`
4. Submit

**Expected**
- Redirected to `/families/[id]`
- Page heading shows "Beal Family"
- Account A appears in the members list with role "Owner"
- Member count shows 1

---

### T-FAM-02 · Family page shows invite options for owner
**Steps**
1. From the family page created in T-FAM-01, confirm Account A is the owner
2. Check for a settings link and a "Copy invite link" button

**Expected**
- Both are visible
- Clicking settings navigates to `/families/[id]/settings`

---

### T-FAM-03 · Copy shareable invite link
**Steps**
1. Navigate to the family settings page
2. Click "Copy invite link"

**Expected**
- Toast: "Link copied!"
- Clipboard contains a URL matching the pattern `https://family-gift-registry-zeta.vercel.app/join/[12-char code]`

---

### T-FAM-04 · Join via shareable link (Account B)
**Steps**
1. From T-FAM-03, note the shareable link (e.g. `…/join/abc123def456`)
2. Sign out
3. Log in as Account B
4. Navigate to that shareable link URL
5. Click "Join family"

**Expected**
- Redirected to `/families/[id]`
- Page shows "Beal Family"
- Account B appears in the member list
- Member count is now 2

---

### T-FAM-05 · Unauthenticated join link prompts login
**Steps**
1. Sign out
2. Navigate to the shareable link from T-FAM-03

**Expected**
- Page shows "Join Beal Family" with the family name visible
- Login and "Create account" buttons are shown (not the join button)
- No redirect to `/login` directly — the invite page itself loads

---

### T-FAM-06 · Non-owner cannot see settings link
**Steps**
1. Log in as Account B
2. Navigate to the Beal Family page

**Expected**
- No settings link or gear icon visible for Account B

---

## Section 3 — Gift management

_Run as Account A unless stated._

### T-GIFT-01 · Add a gift (manual)
**Steps**
1. Log in as Account A
2. Navigate to `/gifts/new`
3. Select family: `Beal Family`
4. Title: `Blue Knit Sweater`
5. Description: `Size M, merino wool`
6. Price: `89.99`
7. URL: `https://example.com/sweater`
8. Submit

**Expected**
- Redirected to `/gifts`
- Gift card shows "Blue Knit Sweater" with price $89.99
- Link to example.com is visible on the card

---

### T-GIFT-02 · Add a second gift
**Steps**
1. Navigate to `/gifts/new`
2. Family: `Beal Family`, Title: `French Press Coffee Maker`, Price: `45`
3. Submit

**Expected**
- `/gifts` now shows two gift cards

---

### T-GIFT-03 · Edit a gift
**Steps**
1. On `/gifts`, click the edit link on "Blue Knit Sweater"
2. Change the price to `79.99`
3. Save

**Expected**
- Redirected to `/gifts`
- Price on the card now shows $79.99

---

### T-GIFT-04 · Delete a gift
**Steps**
1. On `/gifts`, click "Remove" on "French Press Coffee Maker"
2. Confirm the dialog

**Expected**
- Gift card disappears from the list
- Only "Blue Knit Sweater" remains

---

### T-GIFT-05 · Owner sees no claim status on own wishlist
**Steps**
1. Log in as Account A (gift owner)
2. Navigate to `/gifts`
3. Inspect the "Blue Knit Sweater" card carefully

**Expected**
- No "Claimed", "Available", or "Purchased" badge visible
- No claim button visible
- This is the manage view — claim data must never appear here

---

### T-GIFT-06 · Empty wishlist state
**Steps**
1. Log in as Account B
2. Navigate to `/gifts`

**Expected**
- Empty state is shown (no gifts listed)
- Prompt to add a gift is visible

---

## Section 4 — Gift claiming (surprise preservation)

_Critical section. These tests verify the core privacy guarantee._

### T-CLAIM-01 · Account B can see Account A's gifts with status
**Steps**
1. Log in as Account B
2. Navigate to `/families/[Beal Family id]`
3. Click "View [A's first name]'s list" on Account A's member card

**Expected**
- Account A's wishlist is visible
- "Blue Knit Sweater" shows an "Available" badge
- A claim button ("I'll get this") is visible

---

### T-CLAIM-02 · Claim a gift
**Steps**
1. From T-CLAIM-01, click "I'll get this" on "Blue Knit Sweater"

**Expected**
- Button changes immediately (optimistic update) — no page reload needed
- Badge changes from "Available" to "Claimed"
- "Mark purchased" and "Unclaim" buttons appear

---

### T-CLAIM-03 · Owner cannot see the claim
**Steps**
1. Sign out, log in as Account A
2. Navigate to `/gifts`
3. Inspect the "Blue Knit Sweater" card

**Expected**
- No "Claimed" badge, no "Purchased" badge, no claim status of any kind
- Card looks identical to before Account B claimed it
- This is the core RLS guarantee — verify it carefully

---

### T-CLAIM-04 · Mark as purchased
**Steps**
1. Log in as Account B
2. Navigate back to Account A's wishlist
3. Click "Mark purchased" on "Blue Knit Sweater"

**Expected**
- Badge changes to "Purchased"
- "Undo" button appears (no more "Mark purchased")
- Card styling changes (amber/gold tint)

---

### T-CLAIM-05 · Owner still cannot see purchased status
**Steps**
1. Log in as Account A
2. Navigate to `/gifts`
3. Inspect "Blue Knit Sweater"

**Expected**
- No "Purchased" indicator, no changed styling
- Card identical to before any claiming occurred

---

### T-CLAIM-06 · Undo purchased → back to claimed
**Steps**
1. Log in as Account B
2. Navigate to Account A's wishlist
3. Click "Undo" on "Blue Knit Sweater"

**Expected**
- Status reverts to "Claimed"
- "Mark purchased" and "Unclaim" buttons reappear

---

### T-CLAIM-07 · Unclaim a gift
**Steps**
1. While on Account A's wishlist as Account B
2. Click "Unclaim" on "Blue Knit Sweater"

**Expected**
- Gift returns to "Available" status
- "I'll get this" button reappears

---

### T-CLAIM-08 · Cannot claim your own gift (UI)
**Steps**
1. Log in as Account A
2. Navigate to `/members/[Account A's userId]?familyId=[id]`
   (try visiting this URL directly if possible, or check if there's a route that leads there)

**Expected**
- Either: the page redirects to `/gifts` (owner viewing own gifts)
- Or: no claim button is shown if the page somehow renders

---

### T-CLAIM-09 · Cannot claim your own gift (API)
**Steps**
1. Log in as Account A
2. In the browser console (or via fetch), run:
   ```js
   fetch('/api/gifts/[blue-sweater-gift-id]/claim', { method: 'POST', headers: {'Content-Type':'application/json'}, body: '{}' })
     .then(r => r.json()).then(console.log)
   ```
   (substitute the actual gift ID visible in the edit URL)

**Expected**
- Response: `{ "error": "You cannot claim your own gift" }` with status 403

---

## Section 5 — Email invite flow

_Requires Resend to be configured and `SUPABASE_SERVICE_ROLE_KEY` set in Vercel._

### T-INV-01 · Send an email invite
**Steps**
1. Log in as Account A
2. Navigate to `/families/[Beal Family id]/settings`
3. Enter email: `test-b@Lumen-test.dev` in the invite field
4. Click "Send invite"

**Expected**
- Toast: "Invite sent to test-b@Lumen-test.dev"
- No error message

---

### T-INV-02 · Invite page loads without auth
**Steps**
1. Sign out
2. If you have access to the invite token (via Supabase dashboard → `family_invites` table), navigate to `/invite/[token]`

**Expected**
- Page shows "You're invited!" and the family name
- Login and "Create account" buttons are visible (user not logged in)

---

### T-INV-03 · Accept invite while logged in
**Steps**
1. Log in as Account B
2. Navigate to `/invite/[token]` from T-INV-02

**Expected**
- Page shows "Accept invitation" button
3. Click "Accept invitation"

**Expected**
- Redirected to `/families/[Beal Family id]`
- Account B appears in the member list

---

### T-INV-04 · Expired/invalid token returns error page
**Steps**
1. Navigate to `/invite/thisisaninvalidtoken`

**Expected**
- Page shows "Invite not found" or similar error message
- No crash or blank page

---

## Section 6 — Navigation and layout

### T-NAV-01 · Nav links work
**Steps**
1. Log in as Account A
2. Click "Home" in the nav

**Expected** — `/dashboard` loads  
3. Click "My wishlist" in the nav

**Expected** — `/gifts` loads

---

### T-NAV-02 · Families appear in nav (if implemented)
**Steps**
1. Log in as Account A (who has "Beal Family")
2. Look at the nav header

**Expected**
- Family name is accessible via nav or dashboard (exact placement depends on current design)

---

### T-NAV-03 · Dashboard shows correct stats
**Steps**
1. Log in as Account A (1 gift, 1 family, Account B also in family)
2. Navigate to `/dashboard`

**Expected**
- "On my wishlist" stat: 1
- "Families" stat: 1
- "Members" stat: 2 (both accounts)
- Greeting uses Account A's first name

---

### T-NAV-04 · Account page loads
**Steps**
1. Navigate to `/account` or click "Account settings" in user menu

**Expected**
- Page shows Account A's name and email
- No crash

---

## Section 7 — Multi-family isolation

### T-ISO-01 · Create a second family
**Steps**
1. Log in as Account A
2. Navigate to `/families/new`, create: `In-Laws`
3. Do NOT add Account B to this family

**Expected**
- Family created, redirected to family page
- Account A is the only member

---

### T-ISO-02 · Add a gift to the second family
**Steps**
1. Navigate to `/gifts/new`
2. Select family: `In-Laws`
3. Title: `In-Laws Gift`, submit

**Expected**
- Gift saved successfully

---

### T-ISO-03 · Account B cannot see In-Laws family or its gifts
**Steps**
1. Log in as Account B
2. Navigate to `/dashboard`

**Expected**
- "In-Laws" family does NOT appear

3. Try navigating directly to the In-Laws family URL (from Account A's session)

**Expected**
- Page returns not-found or redirects — Account B cannot access it

4. Note the gift ID of "In-Laws Gift" from the edit URL while logged in as Account A
5. Log in as Account B and navigate to `/api/gifts/[in-laws-gift-id]`

**Expected**
- 404 or "Not found" response — RLS blocks the query

---

## Section 8 — Edge cases

### T-EDGE-01 · 404 page
**Steps**
1. Navigate to `/this-page-does-not-exist`

**Expected**
- Custom 404 page renders (or Next.js default)
- No unhandled error

---

### T-EDGE-02 · Gift with no image
**Steps**
1. Log in as Account A, navigate to `/gifts/new`
2. Add a gift with only a title (no image URL)
3. Submit, view it on `/gifts`

**Expected**
- Gift card renders with a placeholder image area
- No broken image element

---

### T-EDGE-03 · Long gift title truncates
**Steps**
1. Add a gift with title: `This is a very long gift title that should be truncated in the card layout to prevent overflow`
2. View on `/gifts`

**Expected**
- Text truncates or wraps without breaking the card layout

---

### T-EDGE-04 · Dashboard with no families
**Steps**
1. Log in as Account B (assume B is in Beal Family — if so, create a fresh Account C for this test, or verify with the current state)
2. If Account B has no families, view `/dashboard`

**Expected**
- Empty state shown for families section
- "Create family" prompt visible
- No crash

---

## Running these tests

This document is designed for an AI agent using Playwright MCP tools. Suggested approach:

1. Open the browser: `browser_navigate` to the app URL
2. Take a screenshot after each major action: `browser_take_screenshot`  
3. For assertions, use `browser_snapshot` to inspect the accessibility tree
4. Record pass/fail for each test ID
5. At the end, produce a summary table:

```
| Test ID    | Result | Notes                        |
|------------|--------|------------------------------|
| T-AUTH-01  | PASS   |                              |
| T-AUTH-05  | FAIL   | No error shown on bad login  |
| …          |        |                              |
```

Flag any test marked FAIL with the exact observed vs. expected behaviour.
