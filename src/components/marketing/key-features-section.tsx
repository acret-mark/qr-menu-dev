import Image from "next/image";
import { KEY_FEATURES } from "@/lib/marketing/content";

/**
 * The mockup's 3-card "Key Features" section (spec FR-004). Matches
 * design-reference/marketing/marketing.css's `.mkt-features*`/
 * `.mkt-feature-*` classes exactly: 112/20px section padding (160/40px at
 * 900px+), 40px grid gap below 860px / 24px at 860px+, cards fixed to
 * 480px height at 860px+ with a 60/40 visual/body split. Pro-tier
 * differentiators are intentionally NOT repeated here — they live only in
 * `<PricingSection>`'s per-tier feature list.
 *
 * **Corrected 2026-08-14**: (1) reveal classes were on the outer `<section>`
 * — moved to the section-head and each card individually, matching the
 * reference's actual markup (`mkt-reveal mkt-pop` on each `.mkt-feature-
 * card`, not the section). (2) The "For Owners" card's DOM order is
 * body-then-visual (text above the image) — reversed from the other two
 * cards (visual-then-body, image above text) — a real, deliberate
 * alternating layout in the reference this build was missing entirely.
 */
export function KeyFeaturesSection() {
  return (
    <section
      id="features"
      className="px-5 py-[112px] min-[900px]:px-10 min-[900px]:py-[160px]"
    >
      <div className="mkt-section-head mkt-reveal">
        <h2>Key Features</h2>
      </div>
      <div className="mkt-feature-grid mx-auto grid max-w-[990px] grid-cols-1 gap-10 min-[860px]:grid-cols-3 min-[860px]:gap-6">
        {KEY_FEATURES.map((feature) => {
          const isOwners = feature.title === "For Owners";
          const isCustomers = feature.title === "For Customers";
          const isIconOnly = feature.title === "For your business";
          // Matches marketing.css's per-card hover treatment exactly: the two
          // photo cards slide toward their natural position on hover (30px
          // customers, -30px owners); the icon-only card just scales, via
          // the shared `.mkt-feature-visual img` rule (customers/owners
          // override that with equal-then-later specificity in the
          // reference — reproduced here as distinct group-hover classes).
          const restTransform = isCustomers
            ? "translate-x-[30px] -translate-y-[10px]"
            : isOwners
              ? "-translate-x-[30px] translate-y-[10px]"
              : "";
          const hoverTransform = isCustomers
            ? "group-hover:translate-x-[30px] group-hover:translate-y-0"
            : isOwners
              ? "group-hover:-translate-x-[30px] group-hover:translate-y-0"
              : "group-hover:scale-[1.08]";

          // The icon-only card renders the same real asset as the two photo
          // cards, but NOT via `fill`+`object-cover` — it needs its own
          // fixed intrinsic size (170px wide, auto height), matching the
          // reference's `.icon-only img { width:170px; height:auto }`
          // exactly. Using `fill` here (as the photo cards correctly do)
          // was the actual bug: object-cover stretched this small icon
          // graphic to cover the entire 340px box, making it render far
          // larger than intended instead of a small, centered icon.
          const visual =
            feature.screenshotSrc && !isIconOnly ? (
              <div
                key="visual"
                className="relative h-[340px] shrink-0 overflow-hidden min-[860px]:h-auto min-[860px]:flex-[0_0_60%]"
              >
                <Image
                  src={feature.screenshotSrc}
                  alt=""
                  fill
                  className={`object-cover transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isOwners ? "object-top" : "object-bottom"} ${restTransform} ${hoverTransform}`}
                />
              </div>
            ) : (
              <div
                key="visual"
                className="flex h-[340px] shrink-0 items-center justify-center py-8 min-[860px]:h-auto min-[860px]:flex-[0_0_60%]"
              >
                {feature.screenshotSrc ? (
                  <Image
                    src={feature.screenshotSrc}
                    alt=""
                    width={170}
                    height={161}
                    className="h-auto w-[170px] transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08]"
                  />
                ) : null}
              </div>
            );

          const body = (
            <div
              key="body"
              className={`flex-1 px-5 pt-4 pb-[18px] ${isOwners ? "grid content-end min-[860px]:flex-[0_0_40%]" : "min-[860px]:flex-[0_0_40%]"}`}
            >
              <h3 className="mb-1.5 text-[1.3rem]">{feature.title}</h3>
              <p className="text-[0.95rem] leading-[1.45] text-[var(--mkt-muted)]">
                {feature.description}
              </p>
            </div>
          );

          return (
            <div
              key={feature.title}
              className="mkt-reveal mkt-pop group flex flex-col overflow-hidden rounded-[var(--mkt-radius-card)] border border-[var(--mkt-orange)] bg-[var(--mkt-peach)] min-[860px]:h-[480px]"
            >
              {isOwners ? (
                <>
                  {body}
                  {visual}
                </>
              ) : (
                <>
                  {visual}
                  {body}
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
