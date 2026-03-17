import type { NextConfig } from "next";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.codegrowthkh.site";

const nextConfig: NextConfig = {
  reactStrictMode: false,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "codegrowthkh.onrender.com" },
      { protocol: "https", hostname: "api.codegrowthkh.site" },
      { protocol: "https", hostname: "cdn.codegrowthkh.site" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "http", hostname: "localhost", port: "8080" },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_BASE_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;