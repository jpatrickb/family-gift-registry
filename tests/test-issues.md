# Lumen Test Issues Log

## 2026-04-26

### T-AUTH-02 - Sign up (Account A)
- **URL:** `https://family-gift-registry-zeta.vercel.app/signup`
- **Expected:** Submit redirects to `/dashboard` with greeting and no errors.
- **Observed:** Clicking `Create account` keeps user on `/signup` with no redirect and no visible error toast/inline message.
- **Notes:** Re-tested after a short wait; form values remained and state did not change.

### T-AUTH-03 - Sign up (Account B)
- **URL:** `https://family-gift-registry-zeta.vercel.app/signup`
- **Expected:** Submit redirects to `/dashboard`.
- **Observed:** Clicking `Create account` keeps user on `/signup` with no redirect and no visible success/error state.
- **Notes:** Reproduced with different credentials (`test-b@Lumen-test.dev`).

### T-AUTH-04 - Login
- **URL:** `https://family-gift-registry-zeta.vercel.app/login`
- **Expected:** Valid credentials redirect to `/dashboard` and show authenticated nav/avatar.
- **Observed:** Clicking `Sign in` with `test-a@Lumen-test.dev` + `TestPassword1!` does not redirect and leaves user on `/login` with no visible error.

### T-AUTH-05 - Login with wrong password
- **URL:** `https://family-gift-registry-zeta.vercel.app/login`
- **Expected:** Stay on `/login` with an explicit error state (toast or inline message).
- **Observed:** Stay on `/login` but no visible error message appears after submit.

### T-INV-04 - Expired/invalid token returns error page
- **URL:** `https://family-gift-registry-zeta.vercel.app/invite/thisisaninvalidtoken`
- **Expected:** Friendly "Invite not found" (or similar) page with graceful handling.
- **Observed:** Generic server-error page renders: "This page couldn’t load" / "A server error occurred. Reload to try again." plus `ERROR 3359008953`.

### T-EDGE-01 - 404 page
- **URL:** `https://family-gift-registry-zeta.vercel.app/this-page-does-not-exist`
- **Expected:** Custom or Next.js 404 page.
- **Observed:** Behavior differs by auth state, but both are incorrect:
  - unauthenticated: redirects to `https://family-gift-registry-zeta.vercel.app/login?next=%2Fthis-page-does-not-exist` (login page instead of 404)
  - authenticated: shows generic error UI (`Show Details` / `Reload`) instead of a 404 page

### Additional observation - Join link error handling
- **URL:** `https://family-gift-registry-zeta.vercel.app/join/abc123def456`
- **Expected:** Graceful invalid-code state (similar to invite not-found behavior).
- **Observed:** Error UI appears with only `Show Details` / `Reload` controls and no user-friendly message.

### T-NAV-03 - Dashboard greeting content/time
- **URL:** `https://family-gift-registry-zeta.vercel.app/dashboard`
- **Expected:** Greeting uses local-time period and signed-in user's first name.
- **Observed:** Heading reads `Good evening , there .` at local noon and does not include the user's provided name (`Patrick`).

### T-FAM-01 - Create a family
- **URL:** `https://family-gift-registry-zeta.vercel.app/families/new`
- **Expected:** Submit redirects to `/families/[id]` and shows created family with owner/member count.
- **Observed:** Clicking `Create family` changes button to `Creating…` briefly, then returns to `Create family` without redirect or visible error feedback.

### T-NAV-04 - Account page content
- **URL:** `https://family-gift-registry-zeta.vercel.app/account`
- **Expected:** Account page shows signed-in user's name and email.
- **Observed:** Page renders heading `Account` but identity field shows only `—` (no name/email values).

### T-FAM-02 and family-route access
- **URL:** `https://family-gift-registry-zeta.vercel.app/families`
- **Expected:** Families listing/hub route should render normally for authenticated user.
- **Observed:** Route renders generic error UI with only `Show Details` and `Reload` buttons.
- **Impact:** Blocks family settings/invite/join/member and all multi-user claim tests in Sections 2, 4, 5, and 7.
