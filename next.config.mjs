/** @type {import('next').NextConfig} */
// Applied to every response. A Content-Security-Policy is deliberately not set here: the pages
// rely on inline JSON-LD and Next.js inline scripts, so it needs nonces and its own rollout.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
];

const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
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
