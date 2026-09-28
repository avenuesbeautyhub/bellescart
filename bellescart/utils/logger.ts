/**
 * Centralized logger utility for development-only debugging
 * 
 * This logger only outputs in development mode and automatically sanitizes
 * sensitive data from logs. All sensitive data (tokens, secrets, etc.) should
 * never be logged in production.
 */

type LogLevel = 'log' | 'warn' | 'error' | 'debug' | 'info';

/**
 * Sanitize sensitive data from objects before logging
 * Removes tokens, secrets, passwords, and other sensitive information
 */
const sanitizeData = (data: any): any => {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    // Check for common sensitive patterns
    const sensitivePatterns = [
      /bearer\s+[a-zA-Z0-9\-._~+/]+=*/i,
      /token[a-z0-9]{20,}/i,
      /csrf[a-z0-9]{20,}/i,
      /signature[a-z0-9]{20,}/i,
      /secret[a-z0-9]{20,}/i,
      /password[=:][^\s]+/i,
      /authorization[=:][^\s]+/i,
    ];

    for (const pattern of sensitivePatterns) {
      if (pattern.test(data)) {
        return '[REDACTED]';
      }
    }
    return data;
  }

  if (typeof data === 'object') {
    if (Array.isArray(data)) {
      return data.map(item => sanitizeData(item));
    }

    const sanitized: any = {};
    for (const key in data) {
      const lowerKey = key.toLowerCase();
      
      // Skip sensitive keys entirely
      if ([
        'token', 'refreshtoken', 'accesstoken', 'csrftoken', 
        'secret', 'password', 'signature', 'authorization',
        'cookie', 'set-cookie', 'x-csrf-token', 'x-signature',
        'x-timestamp', 'x-nonce', 'hmac', 'canonical'
      ].includes(lowerKey)) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeData(data[key]);
      }
    }
    return sanitized;
  }

  return data;
};

/**
 * Logger class that only outputs in development mode
 */
class Logger {
  private isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  private logWithLevel(level: LogLevel, ...args: any[]): void {
    if (!this.isDevelopment()) {
      return;
    }

    // Sanitize all arguments
    const sanitizedArgs = args.map(arg => sanitizeData(arg));

    // Forward to console with appropriate method
    switch (level) {
      case 'error':
        console.error(...sanitizedArgs);
        break;
      case 'warn':
        console.warn(...sanitizedArgs);
        break;
      case 'debug':
        console.debug(...sanitizedArgs);
        break;
      case 'info':
        console.info(...sanitizedArgs);
        break;
      default:
        console.log(...sanitizedArgs);
    }
  }

  log(...args: any[]): void {
    this.logWithLevel('log', ...args);
  }

  warn(...args: any[]): void {
    this.logWithLevel('warn', ...args);
  }

  error(...args: any[]): void {
    this.logWithLevel('error', ...args);
  }

  debug(...args: any[]): void {
    this.logWithLevel('debug', ...args);
  }

  info(...args: any[]): void {
    this.logWithLevel('info', ...args);
  }

  /**
   * Log CSRF-related debugging information (development only)
   * Automatically sanitizes tokens
   */
  csrf(message: string, data?: any): void {
    if (!this.isDevelopment()) {
      return;
    }
    this.debug('[CSRF]', message, data ? sanitizeData(data) : '');
  }

  /**
   * Log API request/response information (development only)
   * Automatically sanitizes headers and tokens
   */
  api(message: string, data?: any): void {
    if (!this.isDevelopment()) {
      return;
    }
    this.debug('[API]', message, data ? sanitizeData(data) : '');
  }

  /**
   * Log authentication-related information (development only)
   * Automatically sanitizes tokens
   */
  auth(message: string, data?: any): void {
    if (!this.isDevelopment()) {
      return;
    }
    this.debug('[AUTH]', message, data ? sanitizeData(data) : '');
  }

  /**
   * Log proxy-related information (development only)
   * Automatically sanitizes secrets and signatures
   */
  proxy(message: string, data?: any): void {
    if (!this.isDevelopment()) {
      return;
    }
    this.debug('[PROXY]', message, data ? sanitizeData(data) : '');
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for convenience
export default logger;
