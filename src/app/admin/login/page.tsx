import { AdminLoginForm } from "@/components/admin/login-form";

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-background">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pt-16 pb-10">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary font-heading text-xl font-bold text-primary-foreground">
            H
          </div>
          <h1 className="mt-3 font-heading text-2xl font-semibold">Hapag Admin</h1>
        </div>

        <AdminLoginForm />
      </div>
    </div>
  );
}
