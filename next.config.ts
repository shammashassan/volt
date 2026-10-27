import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable component caching as in Dime project
  cacheComponents: true,
  partialPrefetching: true,
  async redirects() {
    return [
      {
        source: '/explore',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/account',
        destination: '/settings',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      },
      {
        protocol: 'https',
        hostname: 's0.wp.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'api.microlink.io',
      },
      {
        protocol: 'https',
        hostname: 'avatar.vercel.sh',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
      },
      {
        protocol: 'https',
        hostname: 's4.anilist.co',
      },
    ],
  },
};

export default nextConfig;
