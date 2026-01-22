// @ts-check
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { withPlausibleProxy } from "next-plausible";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  transpilePackages: [
    "@rainbow-me/rainbowkit",
    "@vanilla-extract/css",
    "@vanilla-extract/dynamic",
    "@vanilla-extract/sprinkles",
  ],
  webpack: config => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
};

export default withPlausibleProxy()(nextConfig);
