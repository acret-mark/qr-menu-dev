-- Dev seed data for local Supabase (`supabase db reset` runs this automatically).
-- Fixed UUIDs/slugs so all three devs can reference the same rows in their own
-- branches without re-seeding or coordinating IDs.
--
-- Covers one business per status/plan combo needed across O-04..O-11, C-01..C-05,
-- A-02..A-06, S-03 — see planning/04_data-model.md and planning/03_screen-list.md.
-- Manila Meze (pro) also has seeded item_translations/category_translations rows
-- (ko/ja/zh) so Helper 1 can build the language selector against real cache data
-- without a live DeepL key locally — see planning/added-feature/02_instant-translate.md.
--
-- Login password for every seeded owner/admin below: "password123"

-- ============================================================
-- auth.users (owners + 1 admin)
-- ============================================================

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, recovery_sent_at, last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated',
   'owner-standard@seed.hapag.ph', crypt('password123', gen_salt('bf')),
   now(), null, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated',
   'owner-pro@seed.hapag.ph', crypt('password123', gen_salt('bf')),
   now(), null, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated',
   'owner-pending@seed.hapag.ph', crypt('password123', gen_salt('bf')),
   now(), null, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated',
   'owner-suspended@seed.hapag.ph', crypt('password123', gen_salt('bf')),
   now(), null, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '99999999-9999-9999-9999-999999999999', 'authenticated', 'authenticated',
   'admin@seed.hapag.ph', crypt('password123', gen_salt('bf')),
   now(), null, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');

insert into auth.identities (
  id, provider_id, user_id, identity_data, provider, created_at, updated_at, last_sign_in_at
) values
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   '{"sub":"11111111-1111-1111-1111-111111111111","email":"owner-standard@seed.hapag.ph"}', 'email', now(), now(), now()),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
   '{"sub":"22222222-2222-2222-2222-222222222222","email":"owner-pro@seed.hapag.ph"}', 'email', now(), now(), now()),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
   '{"sub":"33333333-3333-3333-3333-333333333333","email":"owner-pending@seed.hapag.ph"}', 'email', now(), now(), now()),
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444',
   '{"sub":"44444444-4444-4444-4444-444444444444","email":"owner-suspended@seed.hapag.ph"}', 'email', now(), now(), now()),
  (gen_random_uuid(), '99999999-9999-9999-9999-999999999999', '99999999-9999-9999-9999-999999999999',
   '{"sub":"99999999-9999-9999-9999-999999999999","email":"admin@seed.hapag.ph"}', 'email', now(), now(), now());

-- ============================================================
-- admin_users
-- ============================================================

insert into admin_users (id, name, email) values
  ('99999999-9999-9999-9999-999999999999', 'Seed Admin', 'admin@seed.hapag.ph');

-- ============================================================
-- businesses — one per plan/status combo devs need to hit
-- ============================================================

insert into businesses (id, name, slug, logo_url, contact_phone, contact_email, address, owner_id, plan, status, source_language) values
  ('b1111111-0000-0000-0000-000000000001', 'Kubo Kitchen', 'kubo-kitchen', null, '+63 917 111 1111', 'owner-standard@seed.hapag.ph', 'Quezon City, Metro Manila', '11111111-1111-1111-1111-111111111111', 'standard', 'active', 'en'),
  ('b2222222-0000-0000-0000-000000000002', 'Manila Meze', 'manila-meze', null, '+63 917 222 2222', 'owner-pro@seed.hapag.ph', 'Makati, Metro Manila', '22222222-2222-2222-2222-222222222222', 'pro', 'active', 'en'),
  ('b3333333-0000-0000-0000-000000000003', 'Isla Grill', 'isla-grill', null, '+63 917 333 3333', 'owner-pending@seed.hapag.ph', 'Cebu City, Cebu', '33333333-3333-3333-3333-333333333333', 'standard', 'pending', 'en'),
  ('b4444444-0000-0000-0000-000000000004', 'Barrio Bites', 'barrio-bites', null, '+63 917 444 4444', 'owner-suspended@seed.hapag.ph', 'Davao City, Davao', '44444444-4444-4444-4444-444444444444', 'standard', 'suspended', 'en');

-- ============================================================
-- categories
-- ============================================================

insert into categories (id, business_id, name, sort_order) values
  ('c1111111-0000-0000-0000-000000000001', 'b1111111-0000-0000-0000-000000000001', 'Starters', 0),
  ('c1111111-0000-0000-0000-000000000002', 'b1111111-0000-0000-0000-000000000001', 'Mains', 1),
  ('c1111111-0000-0000-0000-000000000003', 'b1111111-0000-0000-0000-000000000001', 'Drinks', 2),
  ('c2222222-0000-0000-0000-000000000001', 'b2222222-0000-0000-0000-000000000002', 'Mezze', 0),
  ('c2222222-0000-0000-0000-000000000002', 'b2222222-0000-0000-0000-000000000002', 'Grills', 1),
  ('c2222222-0000-0000-0000-000000000003', 'b2222222-0000-0000-0000-000000000002', 'Desserts', 2);

-- ============================================================
-- items
-- ============================================================

insert into items (id, category_id, business_id, name, description, description_source, price, photo_url, is_displayed, is_sold_out, is_best_seller, sort_order) values
  ('d1111111-0000-0000-0000-000000000001', 'c1111111-0000-0000-0000-000000000001', 'b1111111-0000-0000-0000-000000000001', 'Lumpiang Shanghai', 'Crispy pork spring rolls, 10 pcs', 'manual', 149.00, null, true, false, true, 0),
  ('d1111111-0000-0000-0000-000000000002', 'c1111111-0000-0000-0000-000000000001', 'b1111111-0000-0000-0000-000000000001', 'Calamares', 'Fried squid rings with garlic mayo', 'manual', 179.00, null, true, false, false, 1),
  ('d1111111-0000-0000-0000-000000000003', 'c1111111-0000-0000-0000-000000000002', 'b1111111-0000-0000-0000-000000000001', 'Crispy Pata', 'Deep-fried pork leg, good for sharing', 'manual', 450.00, null, true, true, true, 0),
  ('d1111111-0000-0000-0000-000000000004', 'c1111111-0000-0000-0000-000000000002', 'b1111111-0000-0000-0000-000000000001', 'Sinigang na Baboy', 'Pork in tamarind broth', 'manual', 259.00, null, true, false, false, 1),
  ('d1111111-0000-0000-0000-000000000005', 'c1111111-0000-0000-0000-000000000003', 'b1111111-0000-0000-0000-000000000001', 'Buko Shake', 'Fresh young coconut shake', 'manual', 99.00, null, false, false, false, 0),
  ('d2222222-0000-0000-0000-000000000001', 'c2222222-0000-0000-0000-000000000001', 'b2222222-0000-0000-0000-000000000002', 'Hummus Platter', 'Chickpea dip, olive oil, warm pita', 'ai_generated', 220.00, null, true, false, true, 0),
  ('d2222222-0000-0000-0000-000000000002', 'c2222222-0000-0000-0000-000000000002', 'b2222222-0000-0000-0000-000000000002', 'Lamb Kofta', 'Grilled spiced lamb skewers', 'ai_generated', 380.00, null, true, false, true, 0),
  ('d2222222-0000-0000-0000-000000000003', 'c2222222-0000-0000-0000-000000000002', 'b2222222-0000-0000-0000-000000000002', 'Chicken Shawarma', 'Marinated chicken, garlic sauce', 'manual', 260.00, null, true, true, false, 1);

-- ============================================================
-- item_translations / category_translations — Manila Meze only (pro),
-- so Helper 1 has non-empty translation data to build C-01/C-03/C-04
-- against before a live DeepL key is available locally. source_language
-- for all seeded businesses is 'en', so there's no 'en' row here — the
-- translate-on-save trigger skips a target language that matches the
-- source language and renders name/description directly. item_translations
-- only carries translated_description — item names are never AI-translated
-- (dish names don't translate well); category_translations still carries
-- translated_name since category labels ("Mezze", "Grills") translate fine.
-- ============================================================

insert into category_translations (category_id, business_id, language_code, translated_name, source_hash) values
  ('c2222222-0000-0000-0000-000000000001', 'b2222222-0000-0000-0000-000000000002', 'ko', '메제', 'seed-hash-cat-c2222222-0000-0000-0000-000000000001'),
  ('c2222222-0000-0000-0000-000000000001', 'b2222222-0000-0000-0000-000000000002', 'ja', 'メゼ', 'seed-hash-cat-c2222222-0000-0000-0000-000000000001'),
  ('c2222222-0000-0000-0000-000000000001', 'b2222222-0000-0000-0000-000000000002', 'zh', '梅泽', 'seed-hash-cat-c2222222-0000-0000-0000-000000000001'),
  ('c2222222-0000-0000-0000-000000000002', 'b2222222-0000-0000-0000-000000000002', 'ko', '그릴', 'seed-hash-cat-c2222222-0000-0000-0000-000000000002'),
  ('c2222222-0000-0000-0000-000000000002', 'b2222222-0000-0000-0000-000000000002', 'ja', 'グリル', 'seed-hash-cat-c2222222-0000-0000-0000-000000000002'),
  ('c2222222-0000-0000-0000-000000000002', 'b2222222-0000-0000-0000-000000000002', 'zh', '烧烤', 'seed-hash-cat-c2222222-0000-0000-0000-000000000002'),
  ('c2222222-0000-0000-0000-000000000003', 'b2222222-0000-0000-0000-000000000002', 'ko', '디저트', 'seed-hash-cat-c2222222-0000-0000-0000-000000000003'),
  ('c2222222-0000-0000-0000-000000000003', 'b2222222-0000-0000-0000-000000000002', 'ja', 'デザート', 'seed-hash-cat-c2222222-0000-0000-0000-000000000003'),
  ('c2222222-0000-0000-0000-000000000003', 'b2222222-0000-0000-0000-000000000002', 'zh', '甜点', 'seed-hash-cat-c2222222-0000-0000-0000-000000000003');

insert into item_translations (item_id, business_id, language_code, translated_description, source_hash) values
  ('d2222222-0000-0000-0000-000000000001', 'b2222222-0000-0000-0000-000000000002', 'ko', '병아리콩 딥, 올리브 오일, 따뜻한 피타', 'seed-hash-item-d2222222-0000-0000-0000-000000000001'),
  ('d2222222-0000-0000-0000-000000000001', 'b2222222-0000-0000-0000-000000000002', 'ja', 'ひよこ豆のディップ、オリーブオイル、温かいピタ', 'seed-hash-item-d2222222-0000-0000-0000-000000000001'),
  ('d2222222-0000-0000-0000-000000000001', 'b2222222-0000-0000-0000-000000000002', 'zh', '鹰嘴豆蘸酱、橄榄油、温热皮塔饼', 'seed-hash-item-d2222222-0000-0000-0000-000000000001'),
  ('d2222222-0000-0000-0000-000000000002', 'b2222222-0000-0000-0000-000000000002', 'ko', '양념한 양고기 꼬치구이', 'seed-hash-item-d2222222-0000-0000-0000-000000000002'),
  ('d2222222-0000-0000-0000-000000000002', 'b2222222-0000-0000-0000-000000000002', 'ja', 'スパイスを効かせた羊肉の串焼き', 'seed-hash-item-d2222222-0000-0000-0000-000000000002'),
  ('d2222222-0000-0000-0000-000000000002', 'b2222222-0000-0000-0000-000000000002', 'zh', '香料腌制羊肉串烤', 'seed-hash-item-d2222222-0000-0000-0000-000000000002'),
  ('d2222222-0000-0000-0000-000000000003', 'b2222222-0000-0000-0000-000000000002', 'ko', '양념 치킨, 마늘 소스', 'seed-hash-item-d2222222-0000-0000-0000-000000000003'),
  ('d2222222-0000-0000-0000-000000000003', 'b2222222-0000-0000-0000-000000000002', 'ja', 'マリネしたチキン、ガーリックソース', 'seed-hash-item-d2222222-0000-0000-0000-000000000003'),
  ('d2222222-0000-0000-0000-000000000003', 'b2222222-0000-0000-0000-000000000002', 'zh', '腌制鸡肉配蒜蓉酱', 'seed-hash-item-d2222222-0000-0000-0000-000000000003');

-- ============================================================
-- subscriptions — covers active, pending (Payment Queue), expired (S-03)
-- ============================================================

insert into subscriptions (id, business_id, plan, amount, status, payment_method, payment_proof_url, activated_by, activated_at, starts_at, expires_at) values
  ('e1111111-0000-0000-0000-000000000001', 'b1111111-0000-0000-0000-000000000001', 'standard', 299.00, 'active', 'gcash', 'https://res.cloudinary.com/seed/proof-1.jpg', '99999999-9999-9999-9999-999999999999', now() - interval '15 days', now() - interval '15 days', now() + interval '15 days'),
  ('e2222222-0000-0000-0000-000000000002', 'b2222222-0000-0000-0000-000000000002', 'pro', 399.00, 'active', 'bank_transfer', 'https://res.cloudinary.com/seed/proof-2.jpg', '99999999-9999-9999-9999-999999999999', now() - interval '5 days', now() - interval '5 days', now() + interval '25 days'),
  ('e3333333-0000-0000-0000-000000000003', 'b3333333-0000-0000-0000-000000000003', 'standard', 299.00, 'pending', 'gcash', 'https://res.cloudinary.com/seed/proof-3.jpg', null, null, null, null),
  ('e4444444-0000-0000-0000-000000000004', 'b4444444-0000-0000-0000-000000000004', 'standard', 299.00, 'expired', 'bank_transfer', 'https://res.cloudinary.com/seed/proof-4.jpg', '99999999-9999-9999-9999-999999999999', now() - interval '45 days', now() - interval '45 days', now() - interval '15 days');

-- ============================================================
-- support_tickets — open, in_progress, resolved-with-reply
-- ============================================================

insert into support_tickets (id, business_id, subject, message, status, admin_reply, replied_at) values
  ('f1111111-0000-0000-0000-000000000001', 'b1111111-0000-0000-0000-000000000001', 'QR code not scanning', 'Customers say the printed QR code doesn''t open the menu.', 'resolved', 'Reprint at 300dpi minimum — the sample you sent was too low-res. Let us know if it persists.', now() - interval '2 days'),
  ('f2222222-0000-0000-0000-000000000002', 'b2222222-0000-0000-0000-000000000002', 'How do I add a second language name?', 'I can only see one language field when adding items.', 'open', null, null),
  ('f3333333-0000-0000-0000-000000000003', 'b3333333-0000-0000-0000-000000000003', 'Payment proof upload stuck', 'Uploaded my GCash screenshot but it still shows pending.', 'in_progress', null, null);
