import type { SupabaseClient } from "@supabase/supabase-js";
import type { SupportTicketDetail, SupportTicketSummary } from "./types";

export async function getSupportTicketsForOwner(
  supabase: SupabaseClient,
  ownerId: string
): Promise<SupportTicketSummary[]> {
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (!business) {
    return [];
  }

  const { data: rows } = await supabase
    .from("support_tickets")
    .select("id, subject, status, created_at")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  return (rows ?? []).map((row) => ({
    id: row.id,
    subject: row.subject,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function getSupportTicketForOwner(
  supabase: SupabaseClient,
  ownerId: string,
  ticketId: string
): Promise<SupportTicketDetail | null> {
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (!business) {
    return null;
  }

  const { data: row } = await supabase
    .from("support_tickets")
    .select("id, subject, message, status, admin_reply, replied_at, created_at")
    .eq("id", ticketId)
    .eq("business_id", business.id)
    .maybeSingle();

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    subject: row.subject,
    message: row.message,
    status: row.status,
    adminReply: row.admin_reply,
    repliedAt: row.replied_at,
    createdAt: row.created_at,
  };
}
