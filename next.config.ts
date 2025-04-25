import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  /* config options here */

  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@contents': path.resolve(__dirname, 'src/contents'),
      '@data': path.resolve(__dirname, 'src/data'),
    };
    return config;
  },
};

export default nextConfig;
