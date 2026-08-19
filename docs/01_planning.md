# Hapag — Planning (Consolidated)
*scan, browse, order*

**Consolidated from**: `planning/01_mvp-features.md` through `planning/08_development-plan.md`, with AI Description Engine and Instant Translate details folded in from `added-feature/`
**Consolidated on**: 2026-07-22

---

# 1. MVP Features

*(from `01_mvp-features.md`)*

**Status**: Planning · June 2026
**Source**: Approved proposal v1.0
**Developer**: Mark Cabatuan · Start: June 2026

## Owner Dashboard

| # | Feature | Notes |
|---|---------|-------|
| 1 | Business registration & profile | Business name, logo, contact info; email/password auth |
| 2 | Menu categories | Create, edit, delete, reorder — unlimited; up/down arrow reorder (no drag-and-drop) |
| 3 | Menu items | Name, price ₱, 1 photo, category assignment. Description: AI drafts a candidate from the item name (+ optional keywords, Pro only) — owner accepts it or declines and writes their own; nothing is saved without the owner's say-so; Standard-plan owners write descriptions manually. Authored in the business's source language only — see #13 for how it reaches customers in other languages. |
| 4 | "Ubos Na" toggle | One-tap sold-out per item, live update on customer view |
| 5 | Best Seller badge | Badge only — items stay in their order (Standard); pinning to top is Pro only |
| 6 | Enable/disable items | Temporarily hide without deleting |
| 7 | QR code generation | One QR per business, auto-generated, download as PNG and PDF |
| 8 | Profile settings | Edit business name, logo, contact info |

## Customer-Facing Menu View

| # | Feature | Notes |
|---|---------|-------|
| 10 | Mobile-optimized menu | Responsive, < 2s load on 3G, no app download required |
| 11 | Category navigation | Browse and jump by category |
| 12 | Item detail | Name, description, price, photo |
| 13 | Auto-translate | Pro only — menu auto-localizes into English, Korean, Japanese, and Mandarin via DeepL, cached per item/category so DeepL isn't re-billed for unchanged text. Browser language detected on load; manual language selector lets the customer override it. Standard shows the business's source language only, no selector. |
| 14 | Sold-out display | Sold-out items grayed out |
| 15 | Best Seller highlights | Badge on flagged items |
| 16 | Search | Search/filter within the menu |
| 17 | Hapag watermark | Footer CTA — "Want this smart digital menu for your food business? Grab yours now," linking to owner registration; positioned to avoid interfering with mobile usability; removed on Pro |

## Admin Panel (Internal — ACRET staff only)

| # | Feature | Notes |
|---|---------|-------|
| 18 | User management | View all registered businesses |
| 19 | Subscription tracking | Plan and status per account |
| 20 | Payment verification | Manually confirm bank transfer payments |
| 21 | Support ticketing | Basic ticket intake |

## Platform / Technical

| # | Feature | Notes |
|---|---------|-------|
| 23 | Payment collection | Manual only — bank transfer / GCash send money; owner submits proof, admin activates subscription |
| 24 | Subscription tiers | Standard ₱299/mo · Pro ₱399/mo |
| 25 | Free trial | Managed manually — no system enforcement needed for MVP |
| 26 | Multi-tenancy | Row-level security per business, data isolation |
| 27 | Image handling | Upload with auto-compression via Cloudinary |
| 28 | Email notifications | Welcome email, payment reminders |
| 29 | Data privacy | Consent flow on registration, data export, account deletion |

## Tier Comparison

| Feature | Standard ₱299/mo | Pro ₱399/mo |
|---------|:-:|:-:|
| Menu builder | ✓ | ✓ |
| "Ubos Na" toggle | ✓ | ✓ |
| Best Seller badge | ✓ | ✓ |
| Pin best sellers / specials to top | — | ✓ |
| QR code generation | ✓ | ✓ |
| Source-language menu | ✓ | ✓ |
| Auto-translate (EN/KO/JA/ZH) | — | ✓ |
| AI description generation | — | ✓ |
| Hapag watermark removed | — | ✓ |

## Out of Scope (MVP)

- Online ordering / payment at point of sale
- Table reservation system
- POS functionality
- Inventory management
- Delivery integration (Grab, Foodpanda)
- Customer accounts / login
- Nutritional information calculator
- Native mobile apps (web-only MVP)
- Drag-and-drop reorder (up/down arrows used instead)

## Decisions Log (MVP Features)

| Question | Decision |
|----------|----------|
| Product name | **Hapag** — tagline: *scan, browse, order* |
| Source language | Every account authors content in one source language (Standard and Pro alike); Pro additionally gets customer-facing auto-translate — see #13 |
| Best Seller vs. Pin to top | Standard = badge only (no reorder); Pro = pin to top of menu |
| Watermark placement | Page footer, positioned to avoid interfering with mobile usability |
| Category reorder | Up/down arrows — no drag-and-drop in MVP |
| Free trial enforcement | Managed manually — no system logic needed |
| Design status | Starts now — Week 1 wireframes not yet done |
| Developer | Mark Cabatuan, starting June 2026 |
| AI description generation | Pro-only — built in full first, with a single `businesses.plan = 'pro'` check added as a final task rather than gating mid-build. Regeneration is capped server-side at a default of 10/item/day to bound cost from repeated "Regenerate" taps and auto-generation-on-blur. |
| Auto-translate | Pro-only — replaces the earlier two-field manual language-toggle concept entirely (one owner-authored source text + DeepL-generated display texts, cached on save), rather than extending it. |

---

# 2. User Flows

*(from `02_user-flows.md`)*

**Status**: Planning · June 2026
**Step**: 2 of 7 — User Flows (light)

## Flow 1 — Owner Onboarding

```
Land on hapag.ph
  → Register (business name, email, password)
  → Confirm email
  → Set up business profile (logo, contact info)
  → Choose plan (Standard / Pro)
  → Submit payment proof (bank transfer / GCash)
  → Wait for admin activation
  → Dashboard unlocked
```

## Flow 2 — Owner: Build Menu

```
Dashboard
  → Add category (name, sort order)
  → Add menu item (name, price, category)
    → AI generates description from name (no extra step required) [Pro]
    → [Optional] Add keywords → Regenerate for a more specific description
    → Owner: Accept (use as generated) / Decline (write own description)
    → Upload photo
  → Toggle "Best Seller" badge
  → Enable / disable item
  → Toggle "Ubos Na" (sold out) per item
  → Reorder categories (up/down arrows)
```

## Flow 3 — Owner: Publish & Share

```
Dashboard
  → QR Code section
  → Auto-generated QR displayed
  → Download as PNG or PDF
  → Print / share QR with customers
```

## Flow 4 — Customer: Browse Menu

```
Scan QR code with phone camera
  → Menu loads in browser (no app download)
  → [Pro] Browser language detected on load → menu renders in matching language
      (falls back to source language if unsupported)
  → See business name, categories
  → Tap category → scroll items
  → Tap item → detail view (name, description, price, photo)
  → Sold-out items grayed out
  → Best Seller badges visible
  → Search bar available
  → [Pro] Manual language selector available to override — selection persists for the session
```

## Flow 5 — Admin: Verify Payment & Activate

```
Admin Panel login
  → View pending payments
  → Confirm bank transfer / GCash proof
  → Activate subscription for business
  → Business owner gets confirmation email
```

## Flow 6 — Admin: Monitor Platform

```
Admin Panel
  → View all registered businesses
  → Check subscription status per account
  → Handle support tickets
```

*Platform analytics (total signups, active menus) is out of MVP scope — deferred to Phase 2, see section 4 (Data Model).*

## Out of Scope (MVP)

- Customer account creation / login
- Online ordering checkout
- Table reservation
- Real-time order notifications

---

# 3. Screen List

*(from `03_screen-list.md`)*

**Status**: Planning · June 2026
**Step**: 3 of 7 — Screen List (IA-lite)

## Owner Dashboard (Authenticated)

| # | Screen | Notes |
|---|--------|-------|
| O-01 | Register | Business name, email, password |
| O-02 | Login | Email/password auth |
| O-03 | Email Confirmation | Confirm account via email link |
| O-04 | Dashboard Home | Overview — quick stats, menu status, QR shortcut |
| O-05 | Business Profile | Edit name, logo, contact info |
| O-06 | Category Manager | List, add, edit, delete, reorder categories |
| O-07 | Menu Item List | All items by category; enable/disable/sold-out toggles |
| O-08 | Add / Edit Item | Name, price, photo upload, category, best seller. Description: [Pro] AI drafts from name (+ optional keywords) — accept/decline gate, regenerate (capped at 10/item/day); Standard writes manually. Consider a soft nudge to add keywords when the generated text comes out short/generic. |
| O-09 | QR Code | View, download PNG, download PDF |
| O-10 | Subscription | Current plan, payment status, submit payment proof — implemented as a tab within `o-05-business-profile.html` rather than a standalone file |
| O-11 | Support | Submit a support ticket — implemented as a tab within `o-05-business-profile.html`; ticket states also have dedicated reference files (`o-11-ticket-open.html`, `o-11-ticket-resolved.html`) |

## Customer-Facing Menu (Public)

**Update (July 2026, during Phase 1 build)**: C-01 and C-02 merged into one screen. Business name/logo, search, and category tabs stay fixed; tapping a tab swaps the visible item list in place rather than navigating to a separate screen. C-02 is retired; C-03/C-04/C-05 keep their existing IDs unchanged.

| # | Screen | Notes |
|---|--------|-------|
| C-01 | Menu (Home + Category View) | Business name/logo, search bar, category tabs — tab selection swaps the item list shown below, no page navigation. [Pro] Language selector visible in the fixed header alongside search. |
| C-03 | Item Detail | Name, description, price, photo; sold-out/best-seller indicators. [Pro] Language selector visible here too. |
| C-04 | Search Results | Filter items by keyword. [Pro] Language selector visible here too. |
| C-05 | 404 / Inactive Menu | "This menu is not currently available" state |

## Admin Panel (Internal — ACRET staff)

| # | Screen | Notes |
|---|--------|-------|
| A-01 | Admin Login | Separate auth from owner login |
| A-02 | Business List | All registered accounts; plan and status |
| A-03 | Business Detail | View single business — profile, menu, subscription history |
| A-04 | Payment Queue | Pending payment proofs awaiting verification |
| A-05 | Activate Subscription | Confirm payment → set plan + billing date |
| A-06 | Support Tickets | View and respond to owner tickets |

## System / Edge States

| # | Screen | Notes |
|---|--------|-------|
| S-01 | Forgot Password | Email reset flow |
| S-02 | Reset Password | New password entry |
| S-03 | Trial Expired / Suspended | Owner sees upgrade prompt |
| S-04 | Error / 500 | Generic error state |

## Screen Count Summary

| Area | Count |
|------|-------|
| Owner Dashboard | 11 |
| Customer Menu | 4 |
| Admin Panel | 6 |
| System / Edge | 4 |
| **Total** | **25** |

---

# 4. Data Model

*(from `04_data-model.md`)*

**Status**: Planning · June 2026
**Step**: 4 of 7 — Data Model
**Database**: PostgreSQL via Supabase (row-level security per business)

## Entity Overview

```
businesses
  └── categories
        └── category_translations
        └── items
              └── item_translations
  └── subscriptions
  └── support_tickets
```

## businesses

Core tenant record. One row = one restaurant/food business.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | auto-generated |
| name | text | Business display name |
| slug | text unique | URL slug — `hapag.ph/menu/slug` |
| logo_url | text | Cloudinary CDN URL |
| contact_phone | text | |
| contact_email | text | |
| address | text | Optional — displayed on menu |
| owner_id | uuid FK → auth.users | Supabase Auth user |
| plan | enum | `standard`, `pro` |
| status | enum | `active`, `suspended`, `trial`, `pending` |
| source_language | enum | `en`, `fil` — the language the owner authors content in. See Instant Translate below. |
| created_at | timestamptz | |

**Auto-translate (Pro)**: `source_language` is a source-only field — it's never a DeepL target. Display languages for customers are `en`/`ko`/`ja`/`zh` (see `item_translations`/`category_translations` below), auto-detected from the customer's browser with a manual override. Standard-plan businesses show `source_language` content only, no selector.

## categories

Menu sections within a business (e.g. Starters, Mains, Drinks).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| business_id | uuid FK → businesses | RLS key |
| name | text | Source-language name |
| sort_order | int | Reorder via up/down arrows |
| created_at | timestamptz | |

Translated names for customers live in `category_translations`, below.

## category_translations

DeepL translation cache for category names. One row per (category, target language); populated by the translate-on-save trigger, not typed by the owner.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| category_id | uuid FK → categories | |
| business_id | uuid FK → businesses | Denormalized for RLS, matches existing pattern |
| language_code | enum (`display_language`: `en`, `ko`, `ja`, `zh`) | Target language |
| translated_name | text | |
| source_hash | text | Hash of `categories.name` at translation time — re-translated only when this changes, keeping DeepL billing flat |
| translated_at | timestamptz | |

Unique on `(category_id, language_code)` — the translate-on-save trigger upserts this row rather than inserting a new one on every save.

## items

Individual menu entries within a category.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| category_id | uuid FK → categories | |
| business_id | uuid FK → businesses | Denormalized for RLS + query efficiency |
| name | text | Source-language name |
| description | text | Optional. Source-language description — either the AI-generated draft the owner accepted, or manually written |
| description_source | enum (`ai_generated`, `manual`) | Nullable — null means no description yet. Set to `ai_generated` when the owner accepts an AI draft, `manual` when written/edited by hand (including editing a previously-accepted AI draft) |
| ai_keywords | text[] | Nullable — optional keywords the owner supplied, kept so "Regenerate" doesn't require re-typing |
| ai_generated_at | timestamptz | Nullable — when the current AI draft was produced |
| price | numeric(10,2) | Philippine Peso ₱ |
| photo_url | text | Cloudinary CDN URL |
| is_displayed | bool | Show/hide on the customer menu, without deleting — set only from Add/Edit Item (O-08), not exposed as a quick toggle on the item list |
| is_sold_out | bool | "Ubos Na" toggle — live update; item stays displayed, just marked out of stock. The quick "Available" toggle on O-07/O-08 controls this field (inverted), not is_displayed |
| is_best_seller | bool | Badge display; Pro also pins to top |
| sort_order | int | Within category |
| created_at | timestamptz | |

Translated description for customers lives in `item_translations`, below — `name` is never translated, always rendered as authored regardless of the customer's selected display language (dish names are often local/proper nouns that don't translate well). Editing an accepted AI-generated description directly is allowed — the edit corrects `description_source` to `manual` at save time rather than requiring an explicit "decline" step first.

## item_translations

DeepL translation cache for item descriptions. One row per (item, target language); populated by the translate-on-save trigger, not typed by the owner. Item names are never translated — there's no `translated_name` column here (contrast with `category_translations` above, where names do translate).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| item_id | uuid FK → items | |
| business_id | uuid FK → businesses | Denormalized for RLS, matches existing pattern |
| language_code | enum (`display_language`: `en`, `ko`, `ja`, `zh`) | Target language |
| translated_description | text | |
| source_hash | text | Hash of `items.description` at translation time — re-translated only when this changes, keeping DeepL billing flat |
| translated_at | timestamptz | |

Unique on `(item_id, language_code)` — the translate-on-save trigger upserts this row rather than inserting a new one on every save. Pre-translated on save, not on first customer view: whenever an owner saves an item/category with changed source text, translation calls to all 4 target languages fire immediately (skipping any target language that equals `source_language`), so customers never see a cache-miss/loading state — the tradeoff is translating some items that may get few views.

## subscriptions

One active subscription per business. History tracked via multiple rows.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| business_id | uuid FK → businesses | |
| plan | enum | `standard`, `pro` |
| amount | numeric(10,2) | ₱299 or ₱399 |
| status | enum | `pending`, `active`, `expired`, `cancelled` |
| payment_method | text | `bank_transfer`, `gcash` |
| payment_proof_url | text | Screenshot uploaded by owner |
| activated_by | uuid FK → admin_users | Admin who confirmed payment |
| activated_at | timestamptz | |
| starts_at | timestamptz | |
| expires_at | timestamptz | |
| created_at | timestamptz | |

## support_tickets

Owner-submitted issues to ACRET admin. One round-trip per ticket (owner asks, admin replies, ticket resolved) — matches "basic support ticketing" in section 1 (MVP Features), not a full multi-message thread.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| business_id | uuid FK → businesses | |
| subject | text | |
| message | text | |
| status | enum | `open`, `in_progress`, `resolved` |
| admin_reply | text | Nullable — set when an admin responds |
| replied_at | timestamptz | Nullable — when `admin_reply` was set |
| created_at | timestamptz | |

Added `admin_reply`/`replied_at` (2026-07-13): the original schema had no way to store an admin's response to a ticket at all — O-11 (owner) and A-06 (admin) both needed a reply to actually go somewhere.

## Indexes

```sql
-- Query performance
CREATE INDEX ON categories (business_id);
CREATE INDEX ON items (business_id);
CREATE INDEX ON items (category_id);
CREATE UNIQUE INDEX ON businesses (slug);
CREATE INDEX ON item_translations (item_id);
CREATE INDEX ON item_translations (business_id);
CREATE INDEX ON category_translations (category_id);
CREATE INDEX ON category_translations (business_id);
```

## Row-Level Security (RLS)

All tables enforce RLS via `business_id`. Owners can only read/write their own rows. Supabase Auth JWT carries the `owner_id`; policy checks `businesses.owner_id = auth.uid()`. `item_translations`/`category_translations` follow the same `business_id`-scoped pattern as `items`/`categories`: owner full CRUD, admin read-all, public read only when the parent business is `active` (no separate `is_displayed` gate on the translation row itself — it inherits visibility from the parent item/category row).

## Enums

```sql
CREATE TYPE plan_type AS ENUM ('standard', 'pro');
CREATE TYPE business_status AS ENUM ('active', 'suspended', 'trial', 'pending');
CREATE TYPE subscription_status AS ENUM ('pending', 'active', 'expired', 'cancelled');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved');
CREATE TYPE source_language AS ENUM ('en', 'fil');
CREATE TYPE display_language AS ENUM ('en', 'ko', 'ja', 'zh');
CREATE TYPE description_source AS ENUM ('ai_generated', 'manual');
```

`source_language` is the language the owner authors content in; `display_language` is what a customer can select on the menu.

## What Is NOT in the Data Model (MVP)

- Orders table — no online ordering
- Reservations — no table booking
- Customer accounts — browse-only, no login
- Staff / roles — single owner per business
- Locations — one QR per business only
- Inventory / stock counts — sold-out is a boolean toggle only
- Analytics table — deferred to Phase 2; visitor-language analytics (which display language a customer viewed) is explicitly out of scope for auto-translate too, not just the deferred analytics table
- Category-level show/hide toggle — dropped 2026-07-13; not in MVP feature list, and the real need (hide a category with no active items) is covered by the customer menu skipping empty categories, not a manual per-category flag

---

# 5. Wireframes

*(from `05_wireframes.md`)*

**Status**: Done (superseded plan) · July 2026
**Step**: 5 of 7 — Wireframes
**Tool**: Gemini (AI image generation), not Figma — see `wireframes/guide/prompts.md` for the prompts used

## Scope

Wire all 25 screens from section 3 (Screen List) at low fidelity. No color, no final copy — structure and layout only.

**Change from original plan**: rather than a per-screen Figma file, one reference image was generated per phase (five images total, covering all screens in that phase at once). These live in `wireframes/` and are the structural reference carried into Phase 1's UI design step — no separate Figma wireframing pass is planned.

## Priority Order (build in this sequence)

### Phase A — Customer Menu (highest business value, simplest flows)
Reference: `wireframes/01_customer_menu.png`

**Update (July 2026)**: C-01 and C-02 merged into one screen during the static HTML build — see section 3 (Screen List).

| Screen | ID | Status |
|--------|----|--------|
| Menu (Home + Category View) | C-01 | ✓ |
| Item Detail | C-03 | ✓ |
| Search Results | C-04 | ✓ |
| Inactive Menu | C-05 | ✓ |

### Phase B — Owner Core Flow
Reference: `wireframes/02_owner_core_flow.png`, detailed spec in `wireframes/guide/05c_wireframe-owner-core-flow.md`

| Screen | ID | Status |
|--------|----|--------|
| Register | O-01 | ✓ |
| Login | O-02 | ✓ |
| Dashboard Home | O-04 | ✓ |
| Category Manager | O-06 | ✓ |
| Menu Item List | O-07 | ✓ |
| Add / Edit Item | O-08 | ✓ |
| QR Code | O-09 | ✓ |

### Phase C — Owner Supporting Screens
Reference: `wireframes/03_owner_supporting_screens.png`

| Screen | ID | Status |
|--------|----|--------|
| Email Confirmation | O-03 | ✓ |
| Business Profile | O-05 | ✓ |
| Subscription | O-10 | ✓ (tab within O-05 file, no standalone HTML) |
| Support | O-11 | ✓ (tab within O-05 file; ticket-state reference files also exist separately) |

### Phase D — Admin Panel
Reference: `wireframes/04_admin_panel.png`

| Screen | ID | Status |
|--------|----|--------|
| Admin Login | A-01 | ✓ |
| Business List | A-02 | ✓ |
| Business Detail | A-03 | ✓ |
| Payment Queue | A-04 | ✓ |
| Activate Subscription | A-05 | ✓ |
| Support Tickets | A-06 | ✓ |

### Phase E — System / Edge States
Reference: `wireframes/05_system_edge_states.png`

| Screen | ID | Status |
|--------|----|--------|
| Forgot Password | S-01 | ✓ |
| Reset Password | S-02 | ✓ |
| Trial Expired | S-03 | ✓ |
| Error / 500 | S-04 | ✓ |

---

# 6. UI Design

*(from `06_ui-design.md`)*

**Status**: In progress · July 2026
**Step**: 6 of 7 — UI Design (branding layer)
**Input**: Wireframe reference images from section 5 (Wireframes)
**Change from original plan**: no Figma design file. Design decisions are locked directly as a shared CSS token stylesheet in the app repo (`qr-menu-dev/`), and individual screens are built as static HTML reference pages (prompted per-screen, using the wireframe images as structural reference) that pull from those shared tokens — the stylesheet *is* the design system, not a separate hand-off artifact.

## Brand Identity

| Element | Value |
|---------|-------|
| Product name | Hapag |
| Tagline | *scan, browse, order* |
| Language | Language 1-first, language 2 secondary |
| Tone | Warm, appetizing, trustworthy, local |
| Aesthetic | Modern Filipino — clean but not sterile; food-forward |

## Color Palette

*(Finalized — matches the palette already used in the product spec doc, `planning/qr-menu-system(hapag).html`)*

| Role | Color | Notes |
|------|-------|-------|
| Primary / accent | `#1E3D2F` deep green | CTAs, active states, brand anchor |
| Secondary accent | `#A67C3A` amber | Best Seller badges, highlights |
| Background | `#FAF7F1` warm off-white | Not pure white — softer on eyes for menu browsing |
| Surface | `#FFFFFF` | Cards, modals |
| Text primary | `#1B1B18` near-black | Warm-biased, not pure black |
| Text secondary | `#5B5750` warm gray | Descriptions, timestamps |
| Sold-out overlay | Gray wash + reduced opacity | Item still visible but clearly unavailable |
| Success | `#2F855A` green | Activation confirmed, saved state |
| Error | `#B3261E` red | Form errors, payment issues |
| Best Seller badge | Amber (`#A67C3A`) pill | Warm, appetite-forward |

Dark mode tokens (deferred to Phase 2 for the product, but defined now for the shared stylesheet since internal reference pages already need to render in both themes) invert to a deep green-black ground with lightened green/amber accents — see the token stylesheet for exact values.

## Typography

| Role | Font | Notes |
|------|------|-------|
| Display / headings | Playfair Display (via `next/font/google`) | Appetite-forward serif; used on menu home, section titles |
| Body / UI | Inter (via `next/font/google`) | Clean, readable at small sizes on mobile |
| Price | Semi-bold Inter | Prominent ₱ symbol, tabular figures |

Both fonts are self-hosted at build time through Next.js (`next/font/google`) — no runtime font CDN request, no external dependency at request time.

## Iconography

- Simple, outlined icons — no filled heavy icons
- Use only for utility actions (edit, delete, toggle, download)
- No decorative icons on customer menu view — let food photos do the work

## Key UI Patterns

### Customer Menu
- Full-width food photography — photos are the hero
- Category tabs: horizontal scroll, sticky at top
- Item card: photo left / details right (landscape) or photo top / details below (portrait)
- "Ubos Na" state: gray overlay on photo + "Sold Out" pill; price remains visible
- Best Seller badge: small gold pill on item photo corner
- Footer CTA ("Want this smart digital menu for your food business? Grab yours now," linking to owner registration): subtle — Standard plan only
- Language selector (Pro only): flag/label dropdown, fixed in the header near the search bar, present on every customer screen except C-05 (which has no chrome at all); auto-detected on load from the browser, manual override persists for the session

### Owner Dashboard
- Dashboard-style layout (not marketing page)
- Table/list views for category and item management
- Toggle switches for sold-out and enable/disable — large tap targets
- Item form: single-column, mobile-optimized (owners will manage on phone)
- Item form description field (Pro only): loading state while AI drafts → draft shown with Accept/Decline actions → decline (or generation failure) reveals a plain text field for manual entry; a collapsed-by-default keywords input with a "Regenerate" action sits above the draft
- QR screen: QR is large and centered; two clear download buttons

### Admin Panel
- Desktop-first (admin works on laptop)
- Data table layouts; no card grids
- Status badges: color-coded (active = green, pending = amber, suspended = red)

## Responsive Breakpoints

| Breakpoint | Target |
|------------|--------|
| 390px | iPhone (customer menu primary) |
| 768px | Tablet |
| 1024px | Desktop (owner dashboard) |
| 1440px | Wide desktop (admin panel) |

## Design Tokens

- **File**: `qr-menu-dev/src/styles/tokens.css` — shared CSS custom properties (colors, type scale, spacing, radius), light/dark
- No separate Figma file — this stylesheet is the design system, consumed directly by both the static HTML reference pages and the real Next.js/Tailwind/shadcn components
- Component library: shadcn/ui components (already scaffolded in Phase 0), themed via these tokens
- Static HTML reference pages (built next, per-screen, using the wireframe images as structural reference) live under `qr-menu-dev/design-reference/` and are the visual sign-off step before wiring a screen into the real app

## Design Checklist

- [x] Color palette finalized and tokenized
- [x] Typography scale defined (h1–h4, body, label, caption)
- [x] Spacing system (4px base grid)
- [x] Customer menu — all 4 screens designed (C-01 merged with former C-02, see section 3)
- [x] Owner dashboard — all 11 screens designed (count corrected from 12 — matches section 3's O-01..O-11)
- [x] Admin panel — all 6 screens designed
- [x] System/edge states — all 4 screens designed
- [ ] Dark mode assessment — defer to Phase 2 (product); tokens themselves already support both, for internal reference pages
- [ ] Accessibility check — contrast ratios, tap target sizes (min 44px)
- [ ] Hand-off to dev — not applicable; design tokens and reference pages live directly in the app repo

## What Comes After This

Static HTML reference pages, screen by screen, in the priority order from section 5 (Wireframes) → wire each into the real Next.js app in section 7's (Development Plan) build phases.

---

# 7. Tech Stack

*(from `07_tech-stack.md`)*

**Status**: Planning · June 2026

## Summary

**Frontend:** Next.js 14 + Tailwind + shadcn/ui, TanStack Query for server state, PWA for offline menu caching.

**Backend:** Supabase for database, auth, and storage. Cloudinary for image CDN. SendGrid for email. qrcode.js for QR generation (client-side).

**Infrastructure:** Vercel for hosting, Cloudflare for CDN, Sentry for errors.

**Payment:** Manual only — bank transfer / GCash send money. Owner submits proof of payment; admin verifies and activates subscription manually. No payment gateway integration in MVP.

**Database:** PostgreSQL via Supabase with row-level security for multi-tenancy.

## Frontend

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 14+ (App Router) | SSR + edge rendering for fast menu loads |
| UI | Tailwind CSS + shadcn/ui | Mobile-first component system |
| State | React Context + TanStack Query | Local UI state + server state sync |
| PWA | Service Worker | Offline menu view; cache on customer device |
| Browser locale detection (Pro) | `Accept-Language` header (SSR) + `navigator.language` (client fallback) | Read server-side for first paint to avoid a language flash; feeds the auto-translate language selector |

## Backend

| Layer | Technology | Notes |
|-------|-----------|-------|
| Database | Supabase (PostgreSQL) | Multi-tenant with row-level security per business |
| Auth | Supabase Auth | Email/password for owner accounts |
| Storage | Supabase Storage | Menu photos before Cloudinary processing |
| Image CDN | Cloudinary | Auto WebP conversion, compression, CDN delivery |
| QR Generation | qrcode.js | Client-side generation — no server call needed |
| Email | SendGrid | Welcome emails, payment reminders, receipts |
| Text generation LLM (Pro) | Gemini Flash (free tier), Claude Haiku/GPT-4o-mini as paid fallback | AI Description Engine — name (+ optional keywords) in, description out. No vision capability required, which keeps cost trivial (a small fraction of a centavo per call) and makes a free tier viable. Server-side only, API key never exposed client-side; generation happens once per item (cached after acceptance) rather than per menu view, so spend scales with item count, not traffic. Regeneration capped server-side at a default of 10/item/day per business, to bound cost from repeated taps and auto-generation-on-blur. |
| Translation | DeepL API (Pro) | Instant Translate — server-side only, called on save (pre-translate-on-save, not on first customer view). Cached in `item_translations`/`category_translations`, keyed by a hash of the source text, so DeepL isn't re-billed for unchanged text; cost scales with total menu content size (owner count × items × avg text length), not visit count. Item names are never translated (dish names are often local/proper nouns); category names do translate, since they're generic labels like "Mains"/"Drinks". |

## Infrastructure

| Layer | Technology | Notes |
|-------|-----------|-------|
| Hosting | Vercel | Frontend + Edge Functions; auto-scaling |
| Database hosting | Supabase Cloud | Managed PostgreSQL; daily auto-backups (7-day retention) |
| CDN | Cloudflare | Static assets and menu view caching |
| Error tracking | Sentry | Runtime error monitoring |
| Analytics | Vercel Analytics | Page views and performance |

## Payment

| Layer | Technology | Notes |
|-------|-----------|-------|
| Collection | Bank transfer / GCash send money | Owner sends proof of payment to admin |
| Verification | Admin Panel | Admin manually activates subscription after confirming payment |
| Receipts | PDF generation | Simple OR/receipt output for BIR compliance |

## Third-Party Services

| Service | Tool | Tier |
|---------|------|------|
| Product analytics | Google Analytics 4 | Free |
| Customer support chat | Crisp or Intercom | ₱1,500–3,000/mo |
| Domain | .ph domain | ~₱1,500/yr |

## Developer Tooling

| Purpose | Tool |
|---------|------|
| Code repository | GitHub |
| IDE | VS Code |
| Design | Shared CSS token stylesheet + static HTML reference pages (no Figma file — see section 6) |
| API testing | Postman |
| CI/CD | GitHub Actions → Vercel |

## Environments

| Environment | Purpose |
|-------------|---------|
| Development | Local dev — `localhost` |
| Staging | Pre-release testing — `staging.hapag.ph` |
| Production | Live — `hapag.ph` |

## Database Schema

See section 4 (Data Model) for the authoritative schema (full column list, RLS, enums, `support_tickets` table). It supersedes any earlier simplified sketch here — notably, there is no `analytics` table in MVP (deferred to Phase 2). This also includes the `item_translations`/`category_translations` DeepL cache tables and the `description_source`/`ai_keywords`/`ai_generated_at` columns on `items` (both added 2026-07-21).

## Key Performance Targets

| Metric | Target |
|--------|--------|
| Customer menu load time | < 2s on 3G |
| JS bundle size | < 100KB |
| Image format | WebP via Cloudinary |
| Image lazy loading | On all menu photos |
| Database indexes | `business_id`, `category_id` |
| Tenant isolation | Row-level security on all tables |

## Cost Estimates (First 6 Months)

| Service | Free Tier | Paid Tier | When to Upgrade |
|---------|-----------|-----------|-----------------|
| Vercel | Hobby (free) | Pro ~₱1,000/mo | Month 2–3 |
| Supabase | Free | Pro ~₱1,200/mo | Month 3 |
| Cloudinary | Free | Essential ~₱500/mo | Month 2 |
| SendGrid | Free (100/day) | — | Scale as needed |
| Gemini Flash | Free tier | Paid fallback (Claude Haiku/GPT-4o-mini) if free tier is exceeded | Cost scales with total item count (once per item, cached after acceptance), not menu traffic — small fraction of a centavo per call |
| DeepL | — | Pay-as-you-go, billed per character | Cost scales with total menu content size (owner count × items × avg text length), not visit count — the cache is what keeps this flat |
| PayMongo | — | — | Phase 2 — not in MVP |
| Sentry | Free (5k errors/mo) | — | Scale as needed |

## Phase 2 — Additions (Months 2–3)

### Backend

| Layer | Technology | Notes |
|-------|-----------|-------|
| SMS | Semaphore API | WhatsApp/SMS notifications for sold-out reminders |

### Features Requiring New Tech

| Feature | Tech Needed |
|---------|-------------|
| Multiple locations per account | Schema update — `locations` table, QR per location |
| Advanced analytics (peak hours, device breakdown) | GA4 event tracking + custom dashboard |
| Custom branding (colors, fonts) | CSS variables per tenant stored in `businesses` table |
| Dietary filters (Vegetarian, Halal, Vegan) | Tags column on `items` table |
| Social media sharing | Open Graph meta tags on menu view |
| Customer feedback collection | New `feedback` table + form on menu view |
| Bulk import via CSV/Excel | CSV parser (papaparse) + batch insert |

## Phase 3 — Additions (Months 4–6)

### New Services

| Layer | Technology | Notes |
|-------|-----------|-------|
| Mobile app | React Native | iOS + Android — post-MVP |
| Online ordering | PayMongo checkout | Order directly from menu |
| POS integration | Webhook API | Third-party POS systems |
| Kitchen display | WebSockets | Real-time order relay to kitchen screen |

### Features Requiring New Tech

| Feature | Tech Needed |
|---------|-------------|
| Online ordering | PayMongo order flow + `orders` table |
| Table reservation | `reservations` table + calendar UI |
| Loyalty program | `rewards` table + customer accounts |
| Inventory low-stock alerts | Threshold logic + SendGrid/Semaphore triggers |
| Multi-user / staff roles | Supabase Auth roles + `staff` table |
| White-label for food parks | Per-tenant domain routing on Vercel |
| API access | REST API layer + API key management |

---

# 8. Development Plan

*(from `08_development-plan.md`)*

Status: Draft v1.0 · Owner: Mark Cabatuan (ACRET) · Based on: `01`–`07` planning docs + proposal

This plan sequences the build from "planning complete" to "MVP live with pilot restaurants." It resolves a few inconsistencies found across docs (noted below) and turns the proposal's 6–8 week timeline into concrete phases, deliverables, and exit criteria.

## Scope decisions (resolving cross-doc conflicts)

These override anything said in the proposal, since sections 1–7 are the later, more detailed source of truth:

| Topic | Decision | Why |
|---|---|---|
| Payments | Manual only for MVP (bank transfer/GCash, owner uploads proof, admin activates). **No PayMongo in MVP.** | Section 1 (MVP Features) and section 7 (Tech Stack) are explicit; proposal's Week-4 PayMongo task is dropped from MVP scope. |
| Analytics | **No analytics table/dashboard in MVP.** Deferred to Phase 2 (GA4 + custom dashboard). | Section 4 (Data Model) explicitly excludes it; proposal/tech-stack mentions are stale. |
| Support screen ID | Use **O-11 Support** (not O-12) to match section 5 (Wireframes) and the prompts guide. | Numbering typo in section 3 (Screen List). |
| DB schema source of truth | Section 4 (Data Model) (has RLS, enums, indexes, bilingual fields) overrides the simplified schema blocks in section 7 (Tech Stack) and the proposal. | Most complete and internally consistent. |
| AI Description Engine + Instant Translate | Pro-only, built in full with the plan-gate check as a final task. | Both features are built directly into the existing owner-core (O-06/O-08) and customer-menu (C-01/C-03/C-04) tasks rather than as separate workstreams; section 4 has the schema. |

## Current state

- Docs 01–04 (features, flows, screens, data model) — complete.
- Doc 05 (wireframes) — complete, via Gemini-generated reference images (not Figma).
- Doc 06 (UI design) — in progress, palette/type locked, token stylesheet and static reference pages underway.
- Doc 07 (tech stack) — complete, decisions locked.
- **Phase 0 is complete**: repo (`acret-mark/qr-menu-dev`), Next.js + Tailwind + shadcn/ui scaffold, Supabase project (`hapag-dev`) with schema + RLS applied, Cloudinary/SendGrid/Vercel provisioned and linked, CI auto-deploy confirmed.

## Phase 0 — Setup (Week 0, ~2–3 days)

Goal: environment ready so Phase 1 dev starts on infra, not yard-work.

- Create GitHub repo, Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui scaffold.
- Create Supabase project (dev), Cloudinary account, SendGrid account, Vercel project linked to repo.
- Set up `.env` conventions for dev/staging/production; wire GitHub Actions → Vercel deploy on push.
- Register domain, point `hapag.ph` (or staging subdomain) at Vercel.
- Apply the Data Model schema (section 4) as the first Supabase migration (tables, enums, indexes, RLS policies) — even before UI exists, so backend and frontend can build in parallel.

Exit criteria: empty Next.js app deployed to a staging URL; Supabase schema live with RLS; CI green on a no-op PR.

## Phase 1 — UI Design (Week 1)

Goal: unblock frontend build. Revised from the original plan — no Figma wireframing pass. Low-fidelity structure already exists as Gemini-generated reference images (one per phase, in `planning/wireframes/`, see section 5), so this phase goes straight to design: lock a shared token stylesheet, then produce static HTML reference pages screen-by-screen.

1. Build the shared token stylesheet (`qr-menu-dev/src/styles/tokens.css`) per section 6 (UI Design) — palette, type scale, spacing, radius, light/dark.
2. Static HTML reference pages, in the same priority order as section 5 (Wireframes):
   - Phase A — Customer Menu (C-01, C-03, C-04, C-05 — C-02 merged into C-01, see section 3)
   - Phase B — Owner Core Flow (O-01, O-02, O-04, O-06, O-07, O-08, O-09)
   - Phase C — Owner Supporting (O-03, O-05, O-10, O-11)
   - Phase D — Admin Panel (A-01..A-06)
   - Phase E — System/Edge States (S-01..S-04)

Each reference page is plain HTML/Tailwind pulling from the shared tokens, prompted using the matching wireframe image as structural reference, and lives in the repo (`qr-menu-dev/design-reference/`) so it's version-controlled and directly copy-able into real JSX later — not a throwaway preview. Use `05c_wireframe-owner-core-flow.md`'s pixel-level specs directly for the Owner Core Flow screens.

Exit criteria: token stylesheet in place and rendering correctly in both themes; static reference pages built for all 25 screens, matching the wireframe images' structure.

**Progress**:
- Phase A (Customer Menu) done — C-01 (merged Menu Home/Category View, tab click swaps the item list client-side rather than navigating), C-03, C-04, C-05 built in `qr-menu-dev/design-reference/customer/`.
- Phase B (Owner Core Flow) done — O-01, O-02, O-04, O-06, O-07, O-08, O-09 built in `qr-menu-dev/design-reference/owner/`, plus a bottom tab bar (Dashboard/Menu/Categories/QR) added across the 4 primary destinations for discoverable navigation.
- Phase C (Owner Supporting) done — O-03, O-05, O-10, O-11 built in the same folder. No pixel spec existed for this phase (only Phase B has one); built directly from section 3 + section 6 patterns. Wired O-04's avatar → O-05 and Plan/Status card → O-10 to give these screens an entry point, since none existed.
- Phase E (System/Edge States) done — S-01, S-02, S-03, S-04 built in `qr-menu-dev/design-reference/system/`. Wired O-02's dead "Forgot password?" link to S-01, and S-01/S-02/S-03/S-04 all cross-link into the owner screens (login, dashboard, subscription/support tabs) rather than being dead-end pages.
- Phase D (Admin Panel) done — A-01 through A-06 built in `qr-menu-dev/design-reference/admin/`, using a sidebar-based "minimal SaaS dashboard" shell (collapsible left sidebar, top bar with search, rounded stat cards, data tables, light/dark toggle) matching Vercel/Stripe/Linear/Clerk/Supabase conventions. Also added `admin_reply`/`replied_at` to `support_tickets` (see section 4) since the schema had no column for an admin's response at all — retrofitted into O-11's ticket list too, which is now clickable instead of static rows.

## Phase 2 — Core Owner Flow (Week 2)

Goal: an owner can register, build a menu, and generate a QR code end-to-end (no customer view, no admin, no payment yet).

- Auth: Supabase email/password, O-01 Register, O-02 Login, O-03 Email confirmation, S-01/S-02 forgot/reset password.
- Business profile: O-05 (create on registration, editable after).
- Menu builder: O-06 Category Manager (create/edit/delete, arrow-based reorder), O-07 Menu Item List (quick is_sold_out toggle), O-08 Add/Edit Item (photo upload → Cloudinary, price, description, category, is_displayed, is_sold_out, is_best_seller toggles). O-08 also includes AI description generation (server-side Gemini Flash call, keyword input + regenerate capped at 10/item/day, accept/decline gate).
- Translate-on-save trigger, part of O-06/O-08's own save flow: fires DeepL calls for the 4 target languages, skipping any target language equal to `source_language`, upserted into `item_translations`/`category_translations`.
- Dashboard shell: O-04, navigation between sections.
- QR generation: O-09 — client-side via qrcode.js, encode `hapag.ph/menu/{slug}`, PNG + PDF download.

Exit criteria: a test owner account can register, add ≥1 category and ≥3 items with photos, toggle sold-out/best-seller, and download a working QR PNG/PDF.

## Phase 3 — Customer Menu (Week 3)

Goal: the QR code actually resolves to a real, fast, public menu.

- C-01 Menu (merged Home + Category View — category tabs swap the item list client-side), C-03 Item Detail, C-04 Search Results, C-05 404/inactive-business state.
- Sold-out items rendered dimmed but visible (never hidden), best-seller badge, footer registration CTA ("Want this smart digital menu for your food business? Grab yours now," linking to owner registration) for Standard tier.
- Language selector: auto-detects browser language on load (`Accept-Language`/`navigator.language`), manual override persists for the session, renders from `item_translations`/`category_translations` with fallback to source-language text on cache miss/failure. Tier gating is a later concern, not part of this build.
- Performance pass: image lazy-loading + WebP via Cloudinary transforms, route-level code splitting, target <2s load on 3G (per section 7's targets).
- PWA basics: service worker for offline menu caching.

Exit criteria: scanning a real QR from Phase 2 loads the live public menu on a phone in <2s on throttled 3G; sold-out/best-seller states and search work; Standard vs Pro rendering differs correctly.

## Phase 4 — Subscriptions, Admin & Manual Payments (Week 4)

Goal: the business side of the business works — someone can actually pay and get activated.

- O-10 Subscription screen (plan display, manual payment instructions, proof upload).
- Admin panel: A-01 Admin Login, A-02 Business List, A-03 Business Detail, A-04 Payment Queue, A-05 Activate Subscription, A-06 Support Tickets.
- O-11 Support (owner-side ticket submission) wired to `support_tickets` table and A-06.
- S-03 Trial Expired/Suspended, S-04 Error/500.
- Email notifications via SendGrid: welcome, payment reminder, activation confirmation.
- End-to-end test: register → build menu → submit payment proof → admin activates → owner receives confirmation email → menu stays live.

Exit criteria: full owner lifecycle works without a developer touching the DB by hand; admin can see and act on every pending business.

## Phase 5 — Hardening & UAT (Week 5, includes buffer)

Goal: production-ready, not just feature-complete.

- Cross-device QA: iOS Safari, Android Chrome, low-end Android (primary customer surface).
- Security pass: verify RLS policies on every table with a second test account (cross-tenant isolation), verify Supabase Auth JWT checks, input validation on all owner-facing forms, review file upload constraints (Cloudinary).
- Data privacy: consent copy, data export, account deletion flow (per section 1's requirement) — required for RA 10173 compliance per the proposal's legal section.
- Error tracking (Sentry) and analytics (Vercel Analytics + GA4 pageviews only — not the deferred custom analytics feature) wired in.
- UAT with 3–5 pilot restaurants: have them register, build a real menu, generate/print a real QR, and get customer feedback scanning it in situ.
- Bug-fix pass based on UAT.

Exit criteria: 3–5 pilot menus live and used by real customers with no P0/P1 bugs open.

## Phase 6 — Soft Launch → Public Launch (Weeks 6–8)

Not a dev phase so much as a go-live gate, but with dev on-call:

- Week 5–6: soft launch, onboard 10–20 free-trial businesses (manual trial tracking, no system enforcement per section 1).
- Weeks 6–8: public launch, marketing push (per proposal's GTM plan), monitor error rates/load times, triage support tickets via A-06.
- Freeze scope here — Phase 2/3 features (PayMongo, multi-location, analytics dashboard, etc.) explicitly do not enter this window.

## Phase 2 (product) backlog — not part of this build, tracked for later

Multi-location + per-location QR, PayMongo checkout, advanced analytics dashboard, SMS/WhatsApp sold-out reminders (Semaphore), custom branding, dietary filter tags, social sharing OG tags, feedback collection, CSV/Excel bulk import. (Phase 3 product backlog — online ordering, reservations, loyalty, KDS, staff roles, white-label, public API, native app — is further out and not detailed here.)

## Sequencing notes

- Phase 0 and the first half of Phase 1 can overlap (infra setup doesn't block wireframing).
- Backend (schema, RLS, auth) should be built ahead of matching UI wherever possible — the schema is already fully specified in section 4, so Phase 2 dev isn't blocked on design decisions, only on Phase 1 delivering component-level UI specs.
- Single developer (per proposal's resourcing) means phases are effectively sequential, not parallel; the estimates above assume one full-time senior/mid full-stack dev plus a freelance designer for Phase 1 only, matching `qr-menu-system-proposal.md`'s team plan.

## Open items to confirm before Phase 0 starts

- Final domain (`hapag.ph` availability/registration).
- Whether the freelance UI/UX designer for Phase 1 is confirmed/available in Week 1.
- Confirm free-trial policy operationally (who resets it, how long, since there's no system enforcement).

---

*ACRET Product Team · Consolidated: 2026-07-22 · Source docs last updated: 2026-07-21*
