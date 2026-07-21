import { PackageX } from "lucide-react";

export function InactiveMenu({ slug }: { slug: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-muted text-muted-foreground">
        <PackageX size={30} strokeWidth={1.8} />
      </div>
      <h1 className="text-xl">This menu isn&rsquo;t available right now</h1>
      <p className="max-w-[32ch] text-sm text-muted-foreground">
        The business may be updating their menu, or this QR code is no longer active. Please check
        with staff, or try again later.
      </p>
      <div className="mt-2 text-xs text-muted-foreground">hapag.ph/menu/{slug}</div>
    </div>
  );
}
