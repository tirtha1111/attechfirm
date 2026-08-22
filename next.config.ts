import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ❌ REMOVED: output: "standalone"
  // "standalone" is for self-hosting (Docker/VPS).
  // Vercel uses its own build pipeline and does NOT support standalone output.

  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
