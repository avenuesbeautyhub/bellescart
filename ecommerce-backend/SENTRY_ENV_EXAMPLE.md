# Sentry Environment Configuration for Backend

Add the following environment variables to your `.env` file for the BellesCart backend:

```bash
# Sentry Configuration
SENTRY_DSN=your-sentry-dsn-here
SENTRY_RELEASE=1.0.0
APP_VERSION=1.0.0
```

## Environment Variables

- `SENTRY_DSN`: The Sentry Data Source Name (DSN) for your Sentry project.
- `SENTRY_RELEASE`: The release version of your application (optional, but recommended for better error tracking).
- `APP_VERSION`: The application version (optional).

## Important Notes

1. **Never commit real Sentry credentials to your repository**
2. **Keep these values secure** - they are server-side only and should never be exposed to the frontend
3. **Different environments should use different Sentry projects or release tags** to separate development and production errors
4. **The backend Sentry integration is designed to run server-side only** and should not expose any sensitive data to clients

## Error Filtering

The backend Sentry configuration is set up to:
- Filter out expected authentication errors (401, 403)
- Filter out expected validation errors (422)
- Filter out expected rate limit errors (429)
- Filter out expected database errors (CastError, ValidationError, MongoError)
- Only capture unexpected server errors (5xx, unexpected exceptions)

This ensures that normal business operations don't create noise in your error tracking while still capturing genuine production issues.