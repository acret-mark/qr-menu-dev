import { STEPS } from "@/lib/marketing/content";

/**
 * Matches design-reference/marketing/marketing.css's `.mkt-steps*` classes
 * exactly: 112/20px section padding (160/40px at 900px+), 56×56 circle
 * numerals, and the connecting line drawn behind the row at 860px+ — a pure
 * CSS `::before` on `.mkt-steps-grid` in the reference (no real DOM
 * element; an earlier version of this file used a real `<div>`, which
 * shifted the step items' `nth-child` position and broke their reveal
 * stagger — see `.mkt-steps-grid::before` in marketing.css).
 */
export function StepsSection() {
  return (
    <section className="bg-[var(--mkt-peach)] px-5 py-[112px] min-[900px]:px-10 min-[900px]:py-[160px]">
      <div className="mkt-section-head mkt-reveal">
        <h2>Live in three steps</h2>
        <p>No printing, no waiting on a designer, no developer required.</p>
      </div>
      <div className="mkt-steps-grid relative mx-auto grid max-w-[990px] grid-cols-1 gap-10 min-[860px]:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.num} className="mkt-reveal relative flex flex-col items-center gap-3 text-center">
            <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-[var(--mkt-radius-pill)] bg-[var(--mkt-orange)] text-[1.3rem] font-extrabold text-white [font-family:var(--font-playfair-display),Georgia,serif]">
              {step.num}
            </div>
            <h3 className="text-[1.25rem]">{step.title}</h3>
            <p className="max-w-[30ch] text-[0.92rem] text-[var(--mkt-muted)]">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
