import { createClient } from "@/lib/supabase/server";
import type { AdminBusinessSummary } from "./types";

export async function getBusinessList(): Promise<AdminBusinessSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("id, name, plan, status, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    plan: row.plan,
    status: row.status,
    createdAt: row.created_at,
  }));
}
