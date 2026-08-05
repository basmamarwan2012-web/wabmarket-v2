import type { NextConfig } from 'next'

/**
 * Wabmarket Next.js Configuration
 * Configured for Next.js 15 (App Router)
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Allowing external images for domain logos and favicons
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig
