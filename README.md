This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

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
