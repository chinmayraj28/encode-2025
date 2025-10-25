/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {}, // Enable Turbopack with default settings
  webpack: undefined, // Remove webpack config
};

module.exports = nextConfig;
