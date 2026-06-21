import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      // Supabase Storage CDN
      { protocol: "https", hostname: "upfimcexlzpycxsapqfy.supabase.co" },
    ],
  },
};

export default nextConfig;
