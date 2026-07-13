-- support_tickets had no column to store an admin's response — added so
-- O-11 (owner) and A-06 (admin) both have somewhere to read/write a reply.
-- One round-trip per ticket, not a full message thread (matches "basic
-- support ticketing" in planning/01_mvp-features.md).

alter table support_tickets
  add column admin_reply text,
  add column replied_at timestamptz;
