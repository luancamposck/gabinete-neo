import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "csivzqansvingomnafom.supabase.co",
        pathname: "/storage/v1/object/public/public-assets/**",
      }
    ]
  }
};

export default nextConfig;
