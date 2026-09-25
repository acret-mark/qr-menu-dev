-- ============================================================
-- CONTRACT phase of the item_categories expand/contract deploy
-- (spec 035-item-multiple-categories) — see
-- 20260905000000_add_item_categories.sql's EXPAND-phase migration for the
-- full plan. Apply this ONLY once the new app code (which reads/writes
-- item_categories exclusively, never items.category_id/sort_order) has
-- been live and stable in production for a bake-in period — by that point
-- nothing reads or writes these two columns any more, so dropping them is
-- safe with no coordinated app-deploy timing required.
--
-- Do not apply this before that bake-in period: items.category_id is the
-- only way to reconstruct a single-category view of the data (e.g. for a
-- rollback to pre-035 app code) until you're confident that's no longer
-- needed. Once any owner has assigned an item to more than one category,
-- that reconstruction is already lossy by construction (category_id can
-- only hold one value) — this migration doesn't change that; it just
-- finalizes a state that's already been true in practice.
-- ============================================================

alter table items drop column category_id;
alter table items drop column sort_order;
