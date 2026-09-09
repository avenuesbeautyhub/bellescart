import app from './app';
import dotenv from 'dotenv';
import { createLogger } from './utils/logger';

const logger = createLogger('Server');

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info('BellesCart E-commerce Backend Server started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    time: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

export default server;
