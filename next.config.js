/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force webpack usage instead of Turbopack (hides Turbopack badge)
  webpack: {},
  
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  
  // Hide ALL development tools, indicators, and overlays
  devIndicators: false,
  
  // Disable React DevTools and Strict Mode
  reactStrictMode: false,
  
  // Production-like settings
  productionBrowserSourceMaps: false,
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Turbopack config (empty to prevent errors)
  turbopack: {},
};

module.exports = nextConfig;
