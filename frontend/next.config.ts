import type { NextConfig } from "next";

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
};

export default nextConfig;
