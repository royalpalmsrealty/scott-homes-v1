import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        // AI-generated blog cover images live in Supabase Storage, not
        // /public — the project ref changes per Supabase project, so this
        // reads from the same env var the app already uses for the DB.
        hostname: process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).hostname : "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
