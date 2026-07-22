import { ConfirmEmailScreen } from "@/components/auth/confirm-email-screen";

export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return <ConfirmEmailScreen email={email ?? null} />;
}
