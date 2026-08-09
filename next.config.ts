import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Default is 1MB — real phone camera photos routinely exceed that.
      // Capped at 4mb, not the app's full validateLogoFile allowance,
      // because Vercel's Serverless Functions hard-cap request bodies at
      // 4.5MB at the infra level — a ceiling next.config can't raise —
      // so this stays under it with headroom for multipart overhead.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
