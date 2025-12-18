import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const isBundleAnalyze = process.env.ANALYZE === "true";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false,
  trailingSlash: true,
  
  // Production optimizations
  compress: true, // gzip compression
  poweredByHeader: false, // Remove X-Powered-By header
  
  images: {
    loader: "custom",
    loaderFile: "./image-loader.ts",
    formats: ["image/avif", "image/webp"], // Modern formats (so our guy can bundle image better)
    minimumCacheTTL: 60,
  },
  
  webpack(config, { isServer }) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });
    
    // Production optimizations
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
      };
    }
    
    return config;
  },
};

export default withBundleAnalyzer({
  enabled: isBundleAnalyze,
})(nextConfig);
