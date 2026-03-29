import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // @ts-expect-error: Built-in next param not typed
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
