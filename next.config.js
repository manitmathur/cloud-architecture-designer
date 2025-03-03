/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Ensure Next.js doesn't try to use features incompatible with static export
  images: { unoptimized: true }
};

module.exports = nextConfig;