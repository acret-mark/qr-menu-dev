import Link from "next/link";
import { ImageOff, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/lib/menu/types";

export function ItemCard({ item, slug }: { item: MenuItem; slug: string }) {
  return (
    <Link
      href={`/menu/${slug}/item/${item.id}`}
      className={cn(
        "flex gap-3 rounded-2xl border border-border bg-card p-3 no-underline",
        item.isSoldOut && "opacity-60"
      )}
    >
      <div
        className={cn(
          "relative flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary to-chart-2 text-primary-foreground/80",
          item.isSoldOut && "grayscale-[70%]"
        )}
      >
        {item.isBestSeller && (
          <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-accent px-1 py-0.5 text-accent-foreground">
            <Star size={10} fill="currentColor" strokeWidth={0} />
          </span>
        )}
        {item.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.photoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImageOff size={30} strokeWidth={1.5} className="opacity-85" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-1.5 text-[0.98rem] font-semibold">
          {item.name}
          {item.isSoldOut && (
            <span className="inline-flex items-center rounded-full bg-muted-foreground px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide text-card">
              Sold Out
            </span>
          )}
        </div>
        {item.description && (
          <div className="line-clamp-2 text-[0.83rem] text-muted-foreground">
            {item.description}
          </div>
        )}
        <div className="mt-auto font-semibold tabular-nums">
          ₱{item.price.toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </div>
      </div>
    </Link>
  );
}
