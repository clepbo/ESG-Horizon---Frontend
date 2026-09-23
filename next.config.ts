import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const isBundleAnalyze = process.env.ANALYZE === "true";

const nextConfig: NextConfig = {
  // "standalone" produces a self-contained server bundle for Docker/self-hosting.
  // Vercel builds and serves Next.js natively and does not use it, so the demo
  // deployment opts out — keeping it would just add an unused bundle to the build.
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
  reactStrictMode: false,
  trailingSlash: true,

  // Production optimizations
  compress: true, // gzip compression
  poweredByHeader: false, // Remove X-Powered-By header

  // Development optimizations
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
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

  async headers() {
    return [
      {
        // version.json must never be cached
        source: "/version.json",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
        ],
      },
      {
        // Immutable hashed assets (_next/static) — cache aggressively
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // HTML pages — revalidate on every request
        source: "/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
      },
    ];
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
