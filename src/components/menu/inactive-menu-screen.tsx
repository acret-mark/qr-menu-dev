import { InactiveMenu } from "@/components/menu/inactive-menu";

export function InactiveMenuScreen({ slug }: { slug: string }) {
  return (
    <div className="mx-auto w-full flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <InactiveMenu slug={slug} />
      </div>
    </div>
  );
}
