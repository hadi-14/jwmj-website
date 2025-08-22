import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
    // ⚠️ only enable if you really trust the source
    // dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
