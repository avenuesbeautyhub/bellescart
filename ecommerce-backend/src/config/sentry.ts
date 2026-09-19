import * as Sentry from '@sentry/node';

// Disable Sentry's internal logger to reduce log noise
process.env.SENTRY_LOG_LEVEL = process.env.NODE_ENV === 'production' ? 'info' : 'none';

// Initialize Sentry
export const initSentry = () => {
  if (process.env.SENTRY_DSN) {
    // Validate DSN format before initializing
    const dsn = process.env.SENTRY_DSN;
    if (!dsn.startsWith('https://') && !dsn.startsWith('http://')) {
      console.log('Invalid Sentry DSN format. DSN must start with https:// or http://. Skipping Sentry initialization.');
      console.log('Current DSN:', dsn);
      return;
    }
    
    // In development, only initialize basic error tracking without performance monitoring
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    Sentry.init({
      dsn: dsn,
      
      // Set environment
      environment: process.env.NODE_ENV || 'development',
      
      // Set sample rate for error reporting
      sampleRate: isDevelopment ? 0.1 : 1.0,
      
      // Completely disable performance monitoring in development to reduce log noise
      tracesSampleRate: isDevelopment ? 0 : 0.1,
      
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
        
        // Filter out Mongoose expected errors
        if (event.message?.includes('CastError') || 
            event.message?.includes('ValidationError') ||
            event.message?.includes('MongoError') ||
            event.message?.includes('Duplicate field')) {
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
            delete filteredHeaders['x-api-key'];
            breadcrumb.data.headers = filteredHeaders;
          }
          
          // Filter sensitive request body data
          if (breadcrumb.data?.body) {
            const filteredBody = { ...breadcrumb.data.body };
            delete filteredBody['password'];
            delete filteredBody['token'];
            delete filteredBody['refreshToken'];
            delete filteredBody['secret'];
            delete filteredBody['apiKey'];
            delete filteredBody['creditCard'];
            delete filteredBody['cvv'];
            delete filteredBody['otp'];
            breadcrumb.data.body = filteredBody;
          }
        }
        return breadcrumb;
      },
      
      // Attach additional context
      initialScope: {
        tags: {
          application: 'bellescart-backend',
        },
      },
      
      // Set release version
      release: process.env.SENTRY_RELEASE || process.env.APP_VERSION,
      
      // Debug mode in development
      debug: process.env.NODE_ENV === 'development',
      
      // Ignore specific error types
      ignoreErrors: [
        // Expected database errors
        'CastError',
        'ValidationError',
        'MongoError',
        
        // Expected network errors
        'ECONNREFUSED',
        'ETIMEDOUT',
        
        // Expected validation errors
        'validation failed',
      ],
      
      // Integrations - disable instrumentation in development to reduce log noise
      integrations: isDevelopment ? [] : [
        // Add production-specific integrations here if needed
      ],
    });
    
    console.log('Sentry initialized for backend');
  } else {
    console.log('Sentry DSN not configured, skipping Sentry initialization');
  }
};

// Helper function to capture exceptions with context
export const captureException = (error: Error, context?: {
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  user?: {
    id?: string;
    email?: string;
    role?: string;
  };
}) => {
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, {
      tags: {
        area: 'backend',
        ...context?.tags,
      },
      extra: context?.extra,
      user: context?.user ? {
        id: context.user.id,
        email: context.user.email ? sanitizeEmail(context.user.email) : undefined,
        role: context.user.role,
      } : undefined,
    });
  }
};

// Helper function to capture messages
export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info', context?: {
  tags?: Record<string, string>;
  extra?: Record<string, any>;
}) => {
  if (process.env.SENTRY_DSN) {
    Sentry.captureMessage(message, {
      level,
      tags: {
        area: 'backend',
        ...context?.tags,
      },
      extra: context?.extra,
    });
  }
};

// Helper function to set user context
export const setUserContext = (user: {
  id?: string;
  email?: string;
  role?: string;
}) => {
  if (process.env.SENTRY_DSN) {
    Sentry.setUser({
      id: user.id,
      email: user.email ? sanitizeEmail(user.email) : undefined,
      role: user.role,
    });
  }
};

// Helper function to clear user context
export const clearUserContext = () => {
  if (process.env.SENTRY_DSN) {
    Sentry.setUser(null);
  }
};

// Helper function to add breadcrumbs
export const addBreadcrumb = (breadcrumb: {
  category?: string;
  message?: string;
  level?: 'debug' | 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}) => {
  if (process.env.SENTRY_DSN) {
    Sentry.addBreadcrumb({
      ...breadcrumb,
      data: breadcrumb.data ? sanitizeBreadcrumbData(breadcrumb.data) : undefined,
    });
  }
};

// Helper function to sanitize email addresses
const sanitizeEmail = (email: string): string => {
  if (!email) return '';
  const [username, domain] = email.split('@');
  if (username && domain) {
    // Show first 2 characters and last 2 characters of username
    const sanitizedUsername = username.length > 4 
      ? `${username.substring(0, 2)}***${username.substring(username.length - 2)}`
      : `${username.substring(0, 1)}***`;
    return `${sanitizedUsername}@${domain}`;
  }
  return '***@***.***';
};

// Helper function to sanitize breadcrumb data
const sanitizeBreadcrumbData = (data: Record<string, any>): Record<string, any> => {
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard', 'cvv', 'otp', 'authorization', 'cookie'];
  const filtered = { ...data };
  
  for (const field of sensitiveFields) {
    if (field in filtered) {
      filtered[field] = '[REDACTED]';
    }
  }
  
  return filtered;
};