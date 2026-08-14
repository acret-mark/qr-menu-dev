import { REGISTER_HREF } from "@/lib/marketing/content";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { HeroSection } from "@/components/marketing/hero-section";
import { AboutSection } from "@/components/marketing/about-section";
import { KeyFeaturesSection } from "@/components/marketing/key-features-section";
import { StepsSection } from "@/components/marketing/steps-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { ClosingCtaSection } from "@/components/marketing/closing-cta-section";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { ScrollEffects } from "@/components/marketing/scroll-effects";

export const metadata = {
  title: "Hapag — scan, browse, order",
  description:
    "An instant, app-free QR digital menu for Philippine food businesses. Scan, browse, order.",
};

/**
 * Public, unauthenticated marketing homepage (FR-017) — replaces the
 * create-next-app scaffold. Section order matches design-reference/
 * marketing/m-01-landing.html exactly (spec FR-015, FR-024): Nav → Hero →
 * About → Key Features → Steps → Pricing → FAQ → Closing CTA → Footer.
 */
export default function MarketingHomePage() {
  return (
    <>
      <MarketingNav registerHref={REGISTER_HREF} />
      <main>
        <HeroSection registerHref={REGISTER_HREF} />
        <AboutSection />
        <KeyFeaturesSection />
        <StepsSection />
        <PricingSection />
        <FaqSection />
        <ClosingCtaSection registerHref={REGISTER_HREF} />
      </main>
      <MarketingFooter />
      <ScrollEffects />
    </>
  );
}
