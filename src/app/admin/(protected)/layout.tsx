import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const isAdmin = await requireAdmin(supabase);

  if (!isAdmin) {
    redirect("/admin/login");
  }

  return <AdminShell>{children}</AdminShell>;
}
