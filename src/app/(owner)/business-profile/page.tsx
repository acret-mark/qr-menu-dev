import { createClient } from "@/lib/supabase/server";
import { getBusinessProfile } from "@/lib/business/profile";
import { BusinessProfilePanel } from "@/components/business/business-profile-panel";
import { AccountTabs } from "@/components/business/account-tabs";
import { SubscriptionPanel } from "@/components/subscription/subscription-panel";
import { SupportPanel } from "@/components/support/support-panel";

export default async function BusinessProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The (owner) layout already guarantees a signed-in user with a valid
  // business row before this page renders.
  const profile = await getBusinessProfile(supabase, user!.id);

  return (
    <AccountTabs
      profilePanel={<BusinessProfilePanel initialProfile={profile!} />}
      subscriptionPanel={<SubscriptionPanel />}
      supportPanel={<SupportPanel />}
    />
  );
}
