import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Set environment
  environment: process.env.NODE_ENV || 'development',
  
  // Set sample rate for error reporting
  sampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0.1,
  
  // Set sample rate for performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.0,
  
  // Filter out expected errors
  beforeSend(event, hint) {
    // Filter out expected authentication errors
    if (event.message?.includes('401') || event.message?.includes('Unauthorized')) {
      return null;
    }
    
    // Filter out expected 404 errors
    if (event.message?.includes('404') || event.message?.includes('Not Found')) {
      return null;
    }
    
    // Filter out expected validation errors
    if (event.message?.includes('422') || event.message?.includes('validation')) {
      return null;
    }
    
    // Filter out expected rate limit errors
    if (event.message?.includes('429') || event.message?.includes('rate limit')) {
      return null;
    }
    
    return event;
  },
  
  // Filter sensitive data from requests
  beforeBreadcrumb(breadcrumb, hint) {
    // Filter out sensitive headers
    if (breadcrumb.category === 'http') {
      if (breadcrumb.data?.headers) {
        const filteredHeaders = { ...breadcrumb.data.headers };
        delete filteredHeaders['authorization'];
        delete filteredHeaders['cookie'];
        delete filteredHeaders['x-csrf-token'];
        delete filteredHeaders['x-signature'];
        delete filteredHeaders['x-timestamp'];
        delete filteredHeaders['x-nonce'];
        breadcrumb.data.headers = filteredHeaders;
      }
    }
    return breadcrumb;
  },
  
  // Attach additional context
  initialScope: {
    tags: {
      application: 'bellescart-frontend-server',
    },
  },
  
  // Set release version
  release: process.env.SENTRY_RELEASE || process.env.APP_VERSION,
  
  // Debug mode in development
  debug: process.env.NODE_ENV === 'development',
  
  // Ignore specific error types
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
  
  // Filter out specific URLs
  denyUrls: [
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
    /^safari-extension:\/\//i,
  ],
});