import type { MetadataRoute } from "next";

// Only the public marketing/legal pages are worth indexing — potential
// restaurant-owner customers search for those. Every other route (per-business
// menu pages, the owner dashboard, the admin panel, all auth/account pages,
// and the API) is reached by direct link or QR scan, never by search, and
// indexing it risks thin/duplicate-content problems at scale (specs/033).
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/privacy", "/terms", "/demo"],
      disallow: [
        "/menu",
        "/dashboard",
        "/categories",
        "/qr",
        "/business-profile",
        "/support",
        "/admin",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/confirm-email",
        "/auth",
        "/account-suspended",
        "/error",
        "/api",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
