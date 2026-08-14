import Link from "next/link";
import { DEMO_BUSINESS_SLUG } from "@/lib/marketing/demo";
import { REGISTER_HREF } from "@/lib/marketing/content";
import { PhoneFrame } from "@/components/marketing/phone-frame";
import { DemoBackLink } from "@/components/marketing/demo-back-link";

export const metadata = { title: "Live demo — Hapag" };

/**
 * Standalone route (FR-006, FR-007) — no auth required, no marketing chrome
 * (that would contradict FR-022's "exactly like scanning a real QR code"
 * intent on mobile). Below 768px (Tailwind's md: breakpoint, per
 * research.md #8): unframed, full-screen. At 768px+: wrapped in
 * <PhoneFrame>, centered (FR-021) — this is the project's own breakpoint,
 * independent of marketing.css's 640/860/900/1024px set (`/speckit-analyze`
 * finding A2).
 */
export default function DemoPage() {
  const iframeSrc = `/menu/${DEMO_BUSINESS_SLUG}`;

  return (
    <div className="min-h-screen bg-[var(--mkt-ink,#1b1b18)]">
      <DemoBackLink />

      {/* Unframed — below md: */}
      <div className="h-screen w-full md:hidden">
        <iframe src={iframeSrc} title="Hapag live menu demo" className="h-full w-full border-0" />
      </div>

      {/* Framed — md: and above */}
      <div className="hidden min-h-screen items-center justify-center py-16 md:flex">
        <PhoneFrame className="max-w-[420px]">
          <iframe
            src={iframeSrc}
            title="Hapag live menu demo"
            className="h-full w-full border-0"
          />
        </PhoneFrame>
      </div>

      <Link
        href={REGISTER_HREF}
        className="fixed right-4 bottom-4 z-50 rounded-full bg-[var(--mkt-orange,#f37342)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-[var(--mkt-orange-deep,#ea5f28)]"
      >
        Register your own menu
      </Link>
    </div>
  );
}
