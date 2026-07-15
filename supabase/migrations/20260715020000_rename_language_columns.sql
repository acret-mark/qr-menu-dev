-- Renames the English/Tagalog-specific language columns and enum values to
-- generic language1/language2 naming, so the schema isn't hardcoded to one
-- specific language pair. This edit was made directly in
-- 20260710015525_initial_schema.sql on disk, but that file was already
-- applied to hapag-dev before the edit — this migration brings the actual
-- remote schema in line with the migration file, same pattern as
-- 20260715010000_drop_categories_is_visible.sql.

alter type language_pref rename value 'en' to 'lang1';
alter type language_pref rename value 'tl' to 'lang2';

alter table categories rename column name_en to name_lang1;
alter table categories rename column name_tl to name_lang2;

alter table items rename column name_en to name_lang1;
alter table items rename column name_tl to name_lang2;
alter table items rename column description_en to description_lang1;
alter table items rename column description_tl to description_lang2;

alter table businesses alter column language set default 'lang1';
