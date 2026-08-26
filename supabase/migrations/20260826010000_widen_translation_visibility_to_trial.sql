-- Fixes a gap left by 20260824010000_widen_public_menu_visibility_to_trial.sql: that migration
-- widened businesses/categories/items' public-read policies from `status = 'active'` to
-- `status in ('active', 'trial')`, but missed item_translations and category_translations
-- (created earlier by 20260721020000_replace_language_model_with_translation_cache.sql), which
-- were still gated to `status = 'active'`. A trial-status business's categories/items are publicly
-- visible but its cached translations were silently unreadable by the anon client (RLS returns an
-- empty set, not an error), so no display-language switch ever showed translated text for it.

drop policy "public can read item translations of active businesses" on item_translations;
create policy "public can read item translations of active businesses"
  on item_translations for select
  using (
    exists (
      select 1 from businesses
      where businesses.id = item_translations.business_id
        and businesses.status in ('active', 'trial')
    )
  );

drop policy "public can read category translations of active businesses" on category_translations;
create policy "public can read category translations of active businesses"
  on category_translations for select
  using (
    exists (
      select 1 from businesses
      where businesses.id = category_translations.business_id
        and businesses.status in ('active', 'trial')
    )
  );
