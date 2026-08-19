import { Fraunces, Bricolage_Grotesque } from "next/font/google";
import { REGISTER_HREF } from "@/lib/marketing/content";
import { TERMS_META, TERMS_SECTIONS } from "@/lib/marketing/terms-content";
import "@/app/(marketing)/marketing.css";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { TermsToc } from "@/components/marketing/terms-toc";
import { TermsContent } from "@/components/marketing/terms-content";

export const metadata = { title: "Terms & Conditions — Hapag" };

/**
 * Real Terms & Conditions page (specs/028-terms-conditions-page, ai_workspace)
 * — replaces the "being finalized" placeholder shipped by
 * 025-marketing-homepage task T009 and left untouched by
 * 027-privacy-policy-page's own FR-011.
 *
 * Deliberately stays at this existing route rather than moving under the
 * `(marketing)` route group (no URL change, no unnecessary route-move
 * churn — plan.md Structure Decision); instead it imports the same
 * marketing chrome and fonts that group's layout.tsx uses (mirroring
 * src/app/privacy/page.tsx's own pattern exactly), so a visitor arriving
 * from the homepage footer's "Terms & conditions" link sees one continuous
 * visual experience (spec FR-003, FR-004). This is the second additional
 * route Constitution Principle V's marketing-homepage exception was
 * extended to name (v1.3.0 → v1.4.0), alongside `/privacy`.
 *
 * Deliberately does NOT apply the homepage's `mkt-reveal` scroll animation
 * (research.md #7) — a visitor following a deep anchor link needs the
 * target section immediately visible, not faded in.
 */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function TermsPage() {
  return (
    <div className={`marketing-page ${fraunces.variable} ${bricolageGrotesque.variable}`}>
      <MarketingNav registerHref={REGISTER_HREF} />
      <main className="px-5 pt-16 min-[900px]:px-10">
        <TermsToc sections={TERMS_SECTIONS} />
        <TermsContent sections={TERMS_SECTIONS} meta={TERMS_META} />
      </main>
      <MarketingFooter />
    </div>
  );
}
