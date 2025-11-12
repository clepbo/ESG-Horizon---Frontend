import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const isBundleAnalyze = process.env.ANALYZE === "true";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  trailingSlash: true,
  images: {
    loader: "custom",
    loaderFile: "./image-loader.ts",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default withBundleAnalyzer({
  enabled: isBundleAnalyze,
})(nextConfig);

// import type { NextConfig } from "next";
// import withBundleAnalyzer from "@next/bundle-analyzer";

// const isBundleAnalyze = process.env.ANALYZE === "true";

// const nextConfig: NextConfig = {
//   reactStrictMode: false,
//   trailingSlash: true,
//   images: {
//     loader: "custom",
//     loaderFile: "./image-loader.ts",
//   },
//   webpack(config) {
//     config.module.rules.push({
//       test: /\.svg$/,
//       issuer: /\.[jt]sx?$/,
//       use: ["@svgr/webpack"],
//     });
//     return config;
//   },
// };

// export default withBundleAnalyzer({
//   enabled: isBundleAnalyze,
// })(nextConfig);
