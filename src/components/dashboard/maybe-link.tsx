import Link from "next/link";
import { cn } from "@/lib/utils";

export function MaybeLink({
  href,
  enabled,
  className,
  children,
}: {
  href: string;
  enabled: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  if (!enabled) {
    return (
      <span aria-disabled="true" className={cn("cursor-not-allowed opacity-40", className)}>
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
