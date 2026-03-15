import type { NextConfig } from "next";

const API_BASE_URL = process.env.API_BASE_URL ?? "https://codegrowthkh.onrender.com"

const nextConfig: NextConfig = {
  reactStrictMode: false,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "pub-21ac384ecd8e4ec88d9c0d2834aa1d5f.r2.dev" },
      { protocol: "https", hostname: "codegrowthkh.onrender.com" },
      { protocol: "http",  hostname: "localhost", port: "8080" },
    ],
  },

  async rewrites() {
    return [
      {
        source     : "/api/:path((?!oauth2/).*)",
        destination: `${API_BASE_URL}/api/:path`,
      },
    ]
  },
};

export default nextConfig;
