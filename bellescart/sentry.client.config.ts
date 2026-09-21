import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Set environment
  environment: process.env.NODE_ENV || 'development',
  
  // Set sample rate for error reporting (100% in production, lower in development)
  sampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0.1,
  
  // Set sample rate for performance monitoring (lower sampling to reduce overhead)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.0,
  
  // Filter out expected errors that shouldn't create noise
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
    
    // Filter out expected business logic errors
    if (event.message?.includes('Invalid') || 
        event.message?.includes('incorrect') || 
        event.message?.includes('expired')) {
      return null;
    }
    
    return event;
  },
  
  // Filter sensitive data from requests
  beforeSendSpan(span) {
    return span;
  },
  
  // Filter sensitive data from breadcrumbs
  beforeBreadcrumb(breadcrumb, hint) {
    // Filter out sensitive headers
    if (breadcrumb.category === 'xhr' || breadcrumb.category === 'fetch') {
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
  
  // Set user context when available (minimal information only)
  integrations: [
    Sentry.browserTracingIntegration(),
  ],
  
  // Attach additional context
  initialScope: {
    tags: {
      application: 'bellescart-frontend',
    },
  },
  
  // Set release version (if available)
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || process.env.NEXT_PUBLIC_APP_VERSION,
  
  // Debug mode in development
  debug: process.env.NODE_ENV === 'development',
  
  // Ignore specific error types
  ignoreErrors: [
    // Expected React errors
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    
    // Expected browser errors
    'Network Error',
    'Failed to fetch',
    
    // Expected authentication errors
    'Token expired',
    'Invalid token',
    'Authentication required',
    
    // Expected business errors
    'Product out of stock',
    'Invalid coupon',
    'Invalid OTP',
  ],
  
  // Filter out specific URLs
  denyUrls: [
    // Browser extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
    /^safari-extension:\/\//i,
  ],
});