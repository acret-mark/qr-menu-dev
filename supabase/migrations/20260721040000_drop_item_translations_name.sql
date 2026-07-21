-- Item names are never AI-translated (spec update, 2026-07-21) — dish names
-- ("Sinigang na Baboy", "Lumpiang Shanghai") are often local/proper nouns
-- that don't translate well, so items.name is always rendered in the
-- business's source language regardless of the customer's selected display
-- language. Only items.description is translated.
--
-- Category names are unaffected by this — they're generic labels
-- ("Starters", "Mains", "Drinks") and still translate normally via
-- category_translations.

alter table item_translations drop column translated_name;
