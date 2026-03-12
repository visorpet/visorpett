import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "lh3.googleusercontent.com" },
      { hostname: "googleusercontent.com" },
      { hostname: "ui-avatars.com" },
      { hostname: "api.dicebear.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: [],
  },
};

export default nextConfig;
