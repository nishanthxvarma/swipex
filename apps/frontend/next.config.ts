import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile monorepo workspace packages
  transpilePackages: [
    "@swipex/ui",
    "@swipex/types",
    "@swipex/utils",
    "@swipex/config",
    "@swipex/hooks",
    "@swipex/api",
    "@swipex/shared",
  ],

  // Optimize images
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },

  // Optimize for Docker deployments
  output: "standalone",

  experimental: {
    // Enable View Transitions API
    viewTransition: true,
  },

  // Environment variables available on the client
  env: {
    NEXT_PUBLIC_APP_NAME: "SwipeX",
    NEXT_PUBLIC_APP_VERSION: "1.0.0",
  },

  // Redirect API calls to FastAPI backend in development
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
