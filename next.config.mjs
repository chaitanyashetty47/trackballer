/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/webp"],
    minimumCacheTTL: 2678400,
    imageSizes: [14, 16, 20, 24, 28, 32, 36, 44, 108],
    deviceSizes: [640, 828, 1080],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.api-sports.io",
        pathname: "/football/**",
      },
      {
        protocol: "https",
        hostname: "images.fotmob.com",
        pathname: "/image_resources/**",
      },
    ],
  },
}

export default nextConfig
