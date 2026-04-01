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
              "frame-ancestors 'self' https://linkedin.com https://www.linkedin.com https://*.linkedin.com https://linkedin-ei.com https://www.linkedin-ei.com https://*.linkedin-ei.com https://licdn.com https://www.licdn.com https://*.licdn.com https://licdn-ei.com https://www.licdn-ei.com https://*.licdn-ei.com https://linkedinmobileapp.com https://www.linkedinmobileapp.com https://*.linkedinmobileapp.com https://lnkd.in https://*.lnkd.in",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
