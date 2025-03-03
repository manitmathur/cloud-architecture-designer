/** @type {import('next').NextConfig} */
module.exports = {
  output: 'export',
  // Disable all features that might cause build issues
  images: { unoptimized: true },
  // Disable CSS processing temporarily
  webpack: (config) => {
    // Skip CSS processing for the build
    const rules = config.module.rules
      .find((rule) => typeof rule.oneOf === 'object')
      .oneOf.filter((rule) => Array.isArray(rule.use));
    
    rules.forEach((rule) => {
      rule.use = rule.use.map((moduleLoader) => {
        if (moduleLoader.loader?.includes('css-loader') ||
            moduleLoader.loader?.includes('postcss-loader')) {
          return { ...moduleLoader, options: { ...moduleLoader.options, modules: false } };
        }
        return moduleLoader;
      });
    });
    
    return config;
  }
};