import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': ['./public/templates/**/*'],
    },
  },
};

export default nextConfig;
