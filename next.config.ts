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
      {
        protocol: "https",
        hostname: "scontent.fkhi16-2.fna.fbcdn.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "scontent.fkhi16-1.fna.fbcdn.net",
        port: "",
        pathname: "/**",
      },
    ],
    // ⚠️ only enable if you really trust the source
    // dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
