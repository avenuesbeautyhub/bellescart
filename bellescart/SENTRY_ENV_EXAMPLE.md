# Sentry Environment Configuration for Frontend

Add the following environment variables to your `.env` file for the BellesCart frontend:

```bash
# Sentry Configuration
SENTRY_DSN=your-sentry-dsn-here
SENTRY_RELEASE=1.0.0
APP_VERSION=1.0.0
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=your-sentry-project
SENTRY_AUTH_TOKEN=your-sentry-auth-token
```

## Environment Variables

- `SENTRY_DSN`: The Sentry Data Source Name (DSN) for your Sentry project. This is public and can be exposed to the browser.
- `SENTRY_RELEASE`: The release version of your application (optional, but recommended for better error tracking).
- `APP_VERSION`: The application version (optional).
- `SENTRY_ORG`: Your Sentry organization slug (used for source map uploads).
- `SENTRY_PROJECT`: Your Sentry project slug (used for source map uploads).
- `SENTRY_AUTH_TOKEN`: Your Sentry authentication token (used for source map uploads - never expose this to the browser).

## Important Notes

1. **Never commit real Sentry credentials to your repository**
2. **`SENTRY_AUTH_TOKEN` should never be exposed to the browser** - it's only used for build-time operations like source map uploads
3. **`SENTRY_DSN` is safe to expose to the browser** - it's designed for client-side error reporting
4. **Different environments should use different Sentry projects or release tags** to separate development and production errors

## Source Maps

For production builds, source maps can be uploaded to Sentry to provide better stack traces. This requires:
- `SENTRY_AUTH_TOKEN` with appropriate permissions
- `SENTRY_ORG` and `SENTRY_PROJECT` configuration
- Running the Sentry CLI or using the Next.js Sentry integration during build

The current configuration in `next.config.ts` includes source map upload settings that will be activated when these environment variables are properly configured.