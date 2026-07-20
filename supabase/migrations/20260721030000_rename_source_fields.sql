-- Renames items/categories' name_lang1/description_lang1 to name/description.
-- The "_lang1" suffix only made sense when a name_lang2/description_lang2
-- counterpart existed (see 20260721020000_replace_language_model_with_translation_cache.sql,
-- which already dropped those) — with a single source-language field per
-- entity, the suffix is vestigial and reads as if a second language field
-- still exists. This is a plain rename, not a data change: RLS policies and
-- indexes reference business_id/category_id/is_displayed, none reference
-- these columns by name, so no policies need to be re-created.

alter table items rename column name_lang1 to name;
alter table items rename column description_lang1 to description;

alter table categories rename column name_lang1 to name;
