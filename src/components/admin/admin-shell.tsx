"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, LifeBuoy, Search, Store, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  icon: LucideIcon;
} & (
  | {
      enabled: true;
      href: string;
      /**
       * Path prefix this section owns, used for the active highlight so child
       * routes (e.g. /admin/payments/[id]) keep their parent item lit. Never the
       * bare "/admin" — that prefixes every admin route.
       */
      section: string;
    }
  | { enabled: false }
);

const NAV_ITEMS: NavItem[] = [
  { label: "Businesses", icon: Store, enabled: true, href: "/admin", section: "/admin/businesses" },
  {
    label: "Payments",
    icon: CreditCard,
    enabled: true,
    href: "/admin/payments",
    section: "/admin/payments",
  },
  { label: "Support", icon: LifeBuoy, enabled: true, href: "/admin/support", section: "/admin/support" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh w-full bg-background text-foreground">
      <aside className="flex w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="flex items-center gap-2 px-4 py-4">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
            H
          </div>
          <span className="font-heading text-sm font-semibold">Hapag Admin</span>
        </div>

        <nav className="flex-1 px-2 py-2">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;

              if (!item.enabled) {
                return (
                  <li key={item.label}>
                    <span
                      aria-disabled="true"
                      className="flex cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/40"
                    >
                      <Icon className="size-4.5" />
                      {item.label}
                    </span>
                  </li>
                );
              }

              const isActive =
                pathname === item.href || pathname?.startsWith(`${item.section}/`) === true;

              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className="size-4.5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-6">
          <div className="flex max-w-xs flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground">
            <Search className="size-4 shrink-0" />
            <span>Search businesses…</span>
          </div>
          <div className="flex-1" />
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            AC
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
