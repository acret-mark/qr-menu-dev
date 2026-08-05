import Link from "next/link";
import { Link2Off } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LinkInvalidScreen() {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-background">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <Link2Off size={24} />
        </div>
        <h1 className="mt-4 font-heading text-2xl font-semibold">Link no longer valid</h1>
        <p className="mt-2 max-w-[30ch] text-sm text-muted-foreground">
          This confirmation link has expired or has already been used. Request a new one to finish
          confirming your account.
        </p>

        <Link
          href="/confirm-email"
          className={cn(buttonVariants({ size: "lg" }), "mt-8 h-11 w-full")}
        >
          Get a new link
        </Link>
      </div>
    </div>
  );
}
