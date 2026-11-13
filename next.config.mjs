/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'e-store.enagic.com',
      },
      {
        protocol: 'https',
        hostname: 'www.enagic.com',
      },
      {
        protocol: 'https',
        hostname: 'enagic.com',
      },
    ],
  },
};

export default nextConfig;
