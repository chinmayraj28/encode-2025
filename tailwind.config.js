/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // You can enable Turbopack safely if you want:
    turbo: true, // "turbo" is the correct key in Next.js 16+
  },
  webpack: (config) => {
    // Optional: if you need to customize webpack
    return config;
  },
};

module.exports = nextConfig;
