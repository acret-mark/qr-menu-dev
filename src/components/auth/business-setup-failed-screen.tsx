import { AlertTriangle } from "lucide-react";
import { BUSINESS_SETUP_FAILED_MESSAGE } from "@/lib/auth/register";

export function BusinessSetupFailedScreen() {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-background">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-warning/10 text-warning-foreground">
          <AlertTriangle size={24} />
        </div>
        <h1 className="mt-4 font-heading text-2xl font-semibold">Email confirmed</h1>
        <p className="mt-2 max-w-[30ch] text-sm text-muted-foreground">
          {BUSINESS_SETUP_FAILED_MESSAGE}
        </p>
      </div>
    </div>
  );
}
