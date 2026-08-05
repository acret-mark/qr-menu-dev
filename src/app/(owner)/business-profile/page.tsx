import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getBusinessProfile } from "@/lib/business/profile";
import { BusinessProfilePanel } from "@/components/business/business-profile-panel";

export default async function BusinessProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The (owner) layout already guarantees a signed-in user with a valid
  // business row before this page renders.
  const profile = await getBusinessProfile(supabase, user!.id);

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard" aria-label="Back to dashboard" className="text-muted-foreground">
          ←
        </Link>
        <h1 className="font-heading text-xl font-semibold">Business Profile</h1>
      </div>

      <BusinessProfilePanel initialProfile={profile!} />
    </div>
  );
}
