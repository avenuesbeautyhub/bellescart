import winston from 'winston';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Tell winston about the colors
winston.addColors(colors);

// Define the format for the logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define different transports for different environments
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
      )
    ),
  }),
];

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  transports.push(
    // Error log file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    // Combined log file
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels,
  format,
  transports,
});

// Filter sensitive data from logs
const filterSensitiveData = (data: any): any => {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard', 'cvv'];
  const filtered = { ...data };
  
  for (const field of sensitiveFields) {
    if (field in filtered) {
      filtered[field] = '[REDACTED]';
    }
  }
  
  return filtered;
};

// Extended logger with request context
export const createLogger = (context: string = 'App') => {
  return {
    error: (message: string, meta?: any) => {
      logger.error({ context, message, meta: filterSensitiveData(meta) });
    },
    warn: (message: string, meta?: any) => {
      logger.warn({ context, message, meta: filterSensitiveData(meta) });
    },
    info: (message: string, meta?: any) => {
      logger.info({ context, message, meta: filterSensitiveData(meta) });
    },
    http: (message: string, meta?: any) => {
      logger.http({ context, message, meta: filterSensitiveData(meta) });
    },
    debug: (message: string, meta?: any) => {
      logger.debug({ context, message, meta: filterSensitiveData(meta) });
    },
  };
};

// Request logger middleware function
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  const { method, url, ip, headers } = req;
  const requestId = req.id || 'unknown';
  
  // Log request
  logger.http('Incoming request', {
    requestId,
    method,
    url,
    ip: ip || req.connection.remoteAddress,
    userAgent: headers['user-agent'],
  });
  
  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http('Request completed', {
      requestId,
      method,
      url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });
  
  next();
};

export default logger;