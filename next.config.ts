import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [],
  turbopack: {
    // Silences the root warning by explicitly setting it
    root: __dirname,
  },
};

export default nextConfig;
