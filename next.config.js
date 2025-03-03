/** @type {import('next').NextConfig} */
const nextConfig = {
  // We should NOT use output: 'export' since it doesn't support API routes
  // output: 'export',
  
  // Add proper configuration for server-side API routes
  reactStrictMode: true,
  swcMinify: true,
  
  // Image optimization configuration
  images: {
    domains: [],
  },
};

module.exports = nextConfig;