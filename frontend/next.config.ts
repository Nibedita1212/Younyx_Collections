// next.config.ts (use only if you must keep webpack changes)
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  turbopack: {},

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/uploads/**",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*",
      },
    ];
  },

  webpack: (config: any, { dev }: { dev: boolean }) => {
    if (dev) {
      try {
        config.devtool = false;
      } catch (e) {
        // ignore
      }
    }
    return config;
  },
};

export default nextConfig;
