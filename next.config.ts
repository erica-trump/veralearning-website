import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/credentials/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://linkedin.com https://www.linkedin.com https://*.linkedin.com",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
