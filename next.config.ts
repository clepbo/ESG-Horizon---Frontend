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

  // Development optimizations
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "highcharts-react-official"],
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  images: {
    loader: "custom",
    loaderFile: "./image-loader.ts",
    formats: ["image/avif", "image/webp"], // Modern formats (so our guy can bundle image better)
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  webpack(config, { isServer, dev }) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    // Development optimizations
    if (dev) {
      // Faster rebuilds in development
      config.cache = {
        type: "filesystem",
      };
    }

    // Production optimizations
    if (!isServer && !dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: "deterministic",
      };
    }

    return config;
  },
};

export default withBundleAnalyzer({
  enabled: isBundleAnalyze,
})(nextConfig);
