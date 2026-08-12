import type { NextConfig } from "next";

const credentialFrameAncestors = [
  "'self'",
  "https://linkedin.com",
  "https://www.linkedin.com",
  "https://*.linkedin.com",
].join(" ");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/story",
        destination: "https://veralearning-briefing.vercel.app/story",
      },
      {
        source: "/story/:path*",
        destination:
          "https://veralearning-briefing.vercel.app/story/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/credentials/:id",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors ${credentialFrameAncestors};`,
          },
        ],
      },
      {
        source: "/credentials/:id/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors ${credentialFrameAncestors};`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
