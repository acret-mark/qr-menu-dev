This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

**First-time setup**: follow "Local Development" below to get a local database running — `npm run
dev` will refuse to start if it can't find one (see that section for why).

Once set up, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Local Development

Local dev runs against its own Supabase database — entirely separate from the production project
the live site uses — so you can test freely without any risk to real prospect-client data. See
`specs/034-local-dev-environment/` (ai_workspace) for the full design; this is the quick version.

**Prerequisites**: Docker (or an equivalent) running, for the Supabase CLI's local stack.

**First-time setup**:

```bash
cp .env.development.local.example .env.development.local
npm run db:start                # starts the local Supabase stack (Docker)
npx supabase status              # copy PUBLISHABLE_KEY / SECRET_KEY into .env.development.local
npm run db:reset                 # applies all migrations + seed data
npm run dev
```

`.env.development.local` is gitignored and loaded by `next dev` with higher priority than
`.env.local` (the Vercel-pulled production config), so your local setup never touches production
config and production is never touched by anything you do locally. **Do not delete this file**
once it's set up, and **never commit it** — only `.env.development.local.example` (the template)
is meant to be committed.

If `.env.development.local` is ever missing or misconfigured, `npm run dev` will fail immediately
with a `[production-guard]` error (`src/instrumentation.ts`) rather than silently connecting to
production — this is intentional, not a bug.

**Seed data**: `supabase/seed.sql` seeds a fixed set of businesses covering every plan/status
combination current features need (active, pending, suspended, trial, and two states around the
subscription grace-period boundary) — see the file's own comments for the full list and login
credentials (all seeded owners/admin use the password `password123`).

**Useful commands**:

```bash
npm run db:start   # start the local Supabase stack
npm run db:reset    # rebuild the local DB from migrations + seed.sql — safe to run anytime
npm run db:stop     # stop the local Supabase stack
```

**Third-party integrations** (Cloudinary, Gmail SMTP, DeepL, Gemini, Anthropic): see the comments
in `.env.development.local` for which are shared with production vs. sandboxed, and any
usage-discipline notes — don't remove those comments when editing the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## CI/CD

Every pull request into `main` runs `.github/workflows/pr-checks.yml`, which checks:

- **Minimum CI gate** — `npm run lint`, `npm run typecheck` (strict TS), `npm run build`.
- **Coding conventions & spec alignment** — PR title must contain the backlog task id (e.g. `[QR_MENU][C-04] Create initial screen`), plus `.github/scripts/check-structure.mjs`: no stray `console.log`/`FIXME`/`HACK`, no secrets (Supabase service role key, Cloudinary secret) outside `src/lib/supabase/server.ts`, no `"use client"` component importing the server-only Supabase client, App Router segments only contain Next.js special files, oversized-file and naming-convention warnings.

Run the same checks locally before opening a PR:

```bash
npm run lint
npm run typecheck
npm run build
node .github/scripts/check-structure.mjs
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
