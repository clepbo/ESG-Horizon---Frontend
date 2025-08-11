// /**
//  * @type {import('next').NextConfig}
//  */
// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//   // output: "export",
//   trailingSlash: true,
//   images: {
//     loader: "custom",
//     loaderFile: "./image-loader.ts",
//   },
// };

// export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    loader: "custom",
    loaderFile: "./image-loader.ts",
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/, // only match svg imports in tsx/jsx files
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
