import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

// Parse backend API URL from environment based on NODE_ENV
const backendApiUrl = process.env.NODE_ENV === 'production'
  ? process.env.PROD_BACKEND_API_URL!
  : process.env.DEV_BACKEND_API_URL!;
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
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
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
