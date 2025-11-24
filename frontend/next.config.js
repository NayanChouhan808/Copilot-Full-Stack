/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Production optimizations
  compress: true,
  
  // Performance
  poweredByHeader: false,
  
  // Image optimization
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Environment variables validation
  env: {
    MODE: process.env.MODE || 'mock',
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Removed X-Frame-Options to allow embedding swagger.html in iframe for /docs.
          // Prefer CSP frame-ancestors directive (add once needed) instead of legacy header.
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      // Optional: explicitly set permissive headers for swagger assets if needed later.
      // {
      //   source: '/swagger.html',
      //   headers: [
      //     { key: 'Cache-Control', value: 'public, max-age=60' }
      //   ]
      // },
    ];
  },
};

module.exports = nextConfig;
