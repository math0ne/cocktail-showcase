/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.thecocktaildb.com',
        pathname: '/images/**',
      },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable filesystem cache in development to prevent WSL2 cache corruption
      config.cache = false;

      // Use polling for file watching (more reliable on WSL2)
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
}

module.exports = nextConfig
