import { createClient } from "@/lib/supabase/server";
import { getBusinessForQr } from "@/lib/qr/queries";
import { QrCodeView } from "@/components/qr/qr-code-view";

export default async function QrCodePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The (owner) layout already guarantees a signed-in user with a valid
  // business row before this page renders.
  const business = await getBusinessForQr(supabase, user!.id);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-xl font-semibold">QR Code</h1>
      {business && <QrCodeView name={business.name} slug={business.slug} />}
    </div>
  );
}
