/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    turbopack: true,
    turbopackRoot: './', // Explicitly set project root
  },
};

module.exports = nextConfig;
