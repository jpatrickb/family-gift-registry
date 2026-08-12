# Lumen List — Family Gift Registry

A web app for families to share wishlists and coordinate gift purchases without spoiling surprises. Family members can see what others want and mark items as claimed or purchased — but the person who added the gift never sees who's buying what for them.

## Features

- Email/password authentication
- Create family groups; invite members by email or shareable link
- Add gifts to your wishlist (title, description, price, URL, image)
- View family members' wishlists and claim gifts
- Surprise preservation: gift owners can't see claim status on their own gifts — enforced at the database level via RLS

## Tech stack

- **Next.js 15** (App Router, TypeScript)
- **Supabase** (Postgres + Auth + Row Level Security)
- **Resend** (transactional email for invites and auth SMTP)
- **TailwindCSS + shadcn/ui**
- **Vercel** (hosting)

## Local setup

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in your credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   RESEND_API_KEY=
   RESEND_FROM_EMAIL="Lumenlist <hello@join.lumenlist.app>"
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. Apply the database migration in your Supabase project (SQL editor or CLI):
   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```

4. Run the dev server:
   ```bash
   npm run dev
   ```

## Environments

There are two Supabase projects:

| Project | Used by | Purpose |
|---|---|---|
| **Staging** (`buimxvybpdgldzpocimp`) | Local dev, every Vercel Preview deployment | Where new migrations get tested first |
| **Production** (`ohzsusvhkplmrgfjhmfw`) | `lumenlist.app` (Production deployments only) | Real user data |

Vercel's `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_SERVICE_ROLE_KEY` are scoped per-environment (Preview → staging, Production → production) so PR preview URLs never touch real user data. `.env.local` should point at staging too.

**Migration workflow** — always staging first, never write a migration straight to production:
```bash
supabase link --project-ref buimxvybpdgldzpocimp   # staging
supabase db push
# test it — locally and/or on a PR's preview deployment
supabase link --project-ref ohzsusvhkplmrgfjhmfw   # production, only once verified
supabase db push
```

The two projects can drift if a migration is applied to one and not the other — `supabase migration list --linked` (after linking to each) shows whether local, staging, and production agree.

## Codebase documentation

See [`CODEBASE.md`](./CODEBASE.md) for a living description of the project structure, design decisions, and current state. This file is updated whenever changes are made to the app.
