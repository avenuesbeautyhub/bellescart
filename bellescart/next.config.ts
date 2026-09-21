import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

// Parse backend API URL from environment (same logic as appConfig.ts)
const isProduction = process.env.NODE_ENV === 'production';
const backendApiUrl = (isProduction 
  ? process.env.PROD_BACKEND_API_URL 
  : process.env.DEV_BACKEND_API_URL) || 'http://127.0.0.1:5000/api';
const apiUrl = new URL(backendApiUrl);

// Build remote patterns dynamically based on API URL
const buildApiRemotePattern = () => {
  const pattern: any = {
    protocol: apiUrl.protocol.replace(':', ''),
    hostname: apiUrl.hostname,
    pathname: '/**',
  };
  
  if (apiUrl.port) {
    pattern.port = apiUrl.port;
  }
  
  return pattern;
};

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      // Localhost patterns for development
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '5000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
      // Dynamic API URL pattern for production
      buildApiRemotePattern(),
    ],
  },
  turbopack: {
    root: __dirname,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
      };
    }
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl.protocol}//${apiUrl.hostname}${apiUrl.port ? ':' + apiUrl.port : ''}/api/:path*`,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  sourcemaps: {
    assets: ['.next/static/**'],
    filesToDeleteAfterUpload: [],
  },
});
