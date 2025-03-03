/** @type {import('next').NextConfig} */
module.exports = {
  output: 'export',
  // Disable image optimization which can cause issues with Electron builds
  images: { unoptimized: true },
  // Simplified webpack configuration
  webpack: (config, { isServer }) => {
    // For Electron, we need to make sure the renderer process can access the CSS
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    
    return config;
  },
  // Since we're using Electron, we can disable strict mode
  reactStrictMode: false,
};