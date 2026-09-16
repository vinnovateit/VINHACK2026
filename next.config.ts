import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongodb"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

// Only needed for `next dev` against the Cloudflare adapter; skip it on Vercel builds.
if (!process.env.VERCEL) {
  initOpenNextCloudflareForDev();
}
