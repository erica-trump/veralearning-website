import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/credentials/:id",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://linkedin.com https://www.linkedin.com https://*.linkedin.com https://licdn.com https://www.licdn.com https://*.licdn.com",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
