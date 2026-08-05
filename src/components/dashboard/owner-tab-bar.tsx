"use client";

import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, Tag, QrCode, type LucideIcon } from "lucide-react";
import { MaybeLink } from "@/components/dashboard/maybe-link";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  icon: LucideIcon;
} & (
  | {
      enabled: true;
      href: string;
      /**
       * Path prefix this section owns, used for the active highlight so
       * child routes keep their parent item lit. See admin-shell.tsx for
       * the same pattern on the admin side.
       */
      section: string;
    }
  | { enabled: false }
);

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: Home, enabled: true, href: "/dashboard", section: "/dashboard" },
  { label: "Menu", icon: UtensilsCrossed, enabled: false },
  { label: "Categories", icon: Tag, enabled: false },
  { label: "QR", icon: QrCode, enabled: false },
];

export function OwnerTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-card">
      <ul className="mx-auto flex max-w-3xl items-stretch justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.enabled &&
            (pathname === item.href || pathname?.startsWith(`${item.section}/`) === true);

          return (
            <li key={item.label} className="flex-1">
              <MaybeLink
                href={item.enabled ? item.href : ""}
                enabled={item.enabled}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-2.5 text-xs",
                  item.enabled && !isActive && "text-muted-foreground",
                  isActive && "text-primary"
                )}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </MaybeLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
