-- AI Description Engine — per planning/added-feature/01_ai-description-engine.md
-- Tracks provenance (AI-generated vs. manually written) so the accept/decline
-- gate and "Regenerate" flow can work without re-deriving state from scratch.

create type description_source as enum ('ai_generated', 'manual');

alter table items
  add column description_source description_source,
  add column ai_keywords text[],
  add column ai_generated_at timestamptz;
