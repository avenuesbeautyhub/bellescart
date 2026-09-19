import mongoose from 'mongoose';
import { createLogger } from '../utils/logger';

const logger = createLogger('Database');

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bellescart';

    logger.info('Attempting to connect to MongoDB', { mongoUri: mongoUri.replace(/:([^:@]+)@/, ':****@') });

    await mongoose.connect(mongoUri, {
      // MongoDB Atlas recommended options
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 60000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 60000,
      retryWrites: true,
      retryReads: true,
      // Connection stability improvements
      connectTimeoutMS: 10000,
      // Reduce reconnection noise
      heartbeatFrequencyMS: 10000,
    });

    logger.info('Connected to MongoDB successfully', { mongoUri: mongoUri.replace(/:([^:@]+)@/, ':****@') });

    // Handle connection events with debouncing to reduce noise
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let disconnectTimeout: NodeJS.Timeout | null = null;

    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error', { error });
    });

    mongoose.connection.on('disconnected', () => {
      // Debounce disconnect messages
      if (disconnectTimeout) clearTimeout(disconnectTimeout);
      disconnectTimeout = setTimeout(() => {
        logger.warn('MongoDB disconnected');
      }, 2000);
    });

    mongoose.connection.on('reconnected', () => {
      // Debounce reconnect messages
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (disconnectTimeout) clearTimeout(disconnectTimeout);
      reconnectTimeout = setTimeout(() => {
        logger.info('MongoDB reconnected');
      }, 2000);
    });

  } catch (error) {
    logger.error('Database connection failed', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from database', { error });
  }
};
