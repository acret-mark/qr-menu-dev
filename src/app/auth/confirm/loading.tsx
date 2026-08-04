import { Loader2 } from "lucide-react";

export default function ConfirmLoading() {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-background">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Loader2 size={24} className="animate-spin" />
        </div>
        <h1 className="mt-4 font-heading text-2xl font-semibold">Confirming your account…</h1>
        <p className="mt-2 max-w-[30ch] text-sm text-muted-foreground">
          Just a moment while we finish setting things up.
        </p>
      </div>
    </div>
  );
}
