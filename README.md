# Family Gift Registry

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
- **Resend** (transactional email for invites)
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

## Codebase documentation

See [`CODEBASE.md`](./CODEBASE.md) for a living description of the project structure, design decisions, and current state. This file is updated whenever changes are made to the app.
