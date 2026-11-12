import type { NextConfig } from "next";
import withSerwist from "@serwist/next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  allowedDevOrigins: ["192.168.0.108", "192.168.1.108"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pflbadrkfkyexqgisvqs.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

const withSerwistConfig = withSerwist({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
});

export default withSerwistConfig(nextConfig);
