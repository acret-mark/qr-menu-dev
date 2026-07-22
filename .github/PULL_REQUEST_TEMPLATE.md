## Summary

<!-- What does this PR do, in 1-3 sentences? -->

## Spec reference

<!-- Which planning doc / screen ID / task item does this implement or change?
     e.g. planning/03_screen-list.md — C-04 Search Results
     e.g. development/01_tasks-mark.md — item 3 -->

## Checklist

- [ ] PR title contains the backlog task id, e.g. `[QR_MENU][C-04] Create initial screen`
- [ ] New/changed routes match the App Router convention (`page.tsx`/`layout.tsx`/`route.ts` only inside `src/app/**`; shared logic lives in `src/lib` or `src/components`)
- [ ] No `console.log`/`console.debug`, no unresolved `FIXME`/`HACK` left in the diff
- [ ] No secrets (Supabase service role key, Cloudinary secret, etc.) added to client-reachable code
- [ ] `npm run lint`, `npm run typecheck`, and `npm run build` pass locally
- [ ] Any new Supabase query is scoped to the correct `business_id` (multi-tenant RLS)

## Screenshots (UI changes only)

<!-- Before/after, if applicable -->
