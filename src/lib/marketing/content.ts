import type { LucideIcon } from "lucide-react";
import { Smartphone, ChefHat, QrCode } from "lucide-react";

/**
 * Static marketing content for the homepage (`/`).
 *
 * Single-file, typed, so pricing/features stay easy to audit against
 * specs/Hapag-SRS.md §4.9 (spec SC-004) — see data-model.md in
 * specs/025-marketing-homepage/ for the full field-by-field contract.
 *
 * IMPORTANT: the two Pro-tier bullets below intentionally do NOT match
 * design-reference/marketing/m-01-landing.html's own pricing card copy.
 * That mockup lists "AI-drafted item descriptions" and "Auto-translate:
 * English, Korean, Japanese & Mandarin" — neither is real SRS scope (§4.9
 * has no AI-description feature; §10 explicitly excludes "languages beyond
 * the two supported"). Corrected here per spec FR-003 — do not "fix" this
 * back to match the mockup's copy.
 */

export const REGISTER_HREF = "/register";
export const LOGIN_HREF = "/login";

export type PricingTier = {
  id: "standard" | "pro";
  name: string;
  priceMonthlyPhp: number;
  features: string[];
  ctaHref: string;
};

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "standard",
    name: "Standard",
    priceMonthlyPhp: 299,
    features: [
      "Menu builder: categories, items, prices, photos",
      '"Ubos Na" sold-out toggle',
      "Best Seller badge",
      "One QR code, generated instantly",
      "Menu shown in your source language",
    ],
    ctaHref: REGISTER_HREF,
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthlyPhp: 399,
    features: [
      "Everything in Standard",
      "Pin best sellers to the top",
      "Language toggle between your two chosen languages",
      'No "Hapag" footer on your menu',
    ],
    ctaHref: REGISTER_HREF,
  },
];

export type FaqEntry = {
  question: string;
  answer: string;
};

export const FAQ_ENTRIES: FaqEntry[] = [
  {
    question: "What is a QR menu?",
    answer:
      "A digital menu your customers open by scanning a QR code with their phone's camera. No app to download. Each business gets one QR code, generated on your device, that opens your menu's own link.",
  },
  {
    question: "How is it different from a printed or PDF menu?",
    answer:
      "You update prices, mark items sold out, and highlight best sellers instantly from your phone. Nothing to reprint or re-upload when something changes.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Ask us when you register: trial availability is confirmed with your account, not a fixed self-serve period yet.",
  },
  {
    question: "How long does setup take?",
    answer:
      "As fast as you can register your account, add your items, categories, and prices, and generate your QR code. The builder itself has no waiting period.",
  },
];

export type BenefitItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  screenshotSrc: string | null;
};

/** Consumed by <KeyFeaturesSection /> — the mockup's 3-card "Key Features" section (spec FR-004). */
export const KEY_FEATURES: BenefitItem[] = [
  {
    title: "For Customers",
    description:
      "Scan a QR code, browse a real menu on their own phone: no app to download, no waiting for a printed one.",
    icon: Smartphone,
    screenshotSrc: "/marketing/feature-owners.webp",
  },
  {
    title: "For Owners",
    description:
      "Update prices, mark items sold out, and highlight best sellers in real time, straight from your phone — nothing to reprint when something changes.",
    icon: ChefHat,
    screenshotSrc: "/marketing/feature-customers.webp",
  },
  {
    title: "For your business",
    description:
      "One QR code, generated instantly, downloadable as PNG or PDF for your tables and counter.",
    icon: QrCode,
    screenshotSrc: "/marketing/feature-business.webp",
  },
];

export type StepItem = {
  num: string;
  title: string;
  description: string;
};

/** Consumed by <StepsSection /> — the mockup's "Live in three steps." */
export const STEPS: StepItem[] = [
  {
    num: "01",
    title: "Register & Confirm",
    description: "Create your business account and confirm your email.",
  },
  {
    num: "02",
    title: "Add your Menu",
    description: "Categories, items, prices, and a photo for each dish.",
  },
  {
    num: "03",
    title: "Generate your QR",
    description:
      "Instantly on your device — download as PNG or PDF for your tables.",
  },
];

export type NavLink = {
  label: string;
  href: string;
};

/** MarketingNav's registration CTA (FR-012) is not a NavLink — see marketing-nav.tsx. */
export const NAV_LINKS: NavLink[] = [
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];
