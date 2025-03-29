import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@fortawesome/fontawesome-svg-core": "@fortawesome/fontawesome-svg-core",
    };
    return config;
  },
};

export default nextConfig;
