import type { NextConfig } from "next";

const BACKEND = process.env.API_BASE_URL ?? 'https://growcodekh.onrender.com'

const nextConfig: NextConfig = {
  // ✅ Stops double renders in development
  reactStrictMode: false,

  // Make backend URL available to client-side code.
  // Values here are baked in at build time, so even if .env is not deployed
  // (it is gitignored) the correct URL is always present.
  env: {
    NEXT_PUBLIC_API_URL: BACKEND,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-21ac384ecd8e4ec88d9c0d2834aa1d5f.r2.dev",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
      },
    ],
  },

//   async redirects() {
//   return [
//     {
//       source: "/:slug(...).+)",
//       destination: "/courses/:slug",
//       permanent: true,
//     },
//     {
//       source: "/:slug(...)/:lesson",
//       destination: "/courses/:slug/:lesson",
//       permanent: true,
//     },
//   ];
// },

};

export default nextConfig;
