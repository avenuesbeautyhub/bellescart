import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bellescart';

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

    console.log('Connected to MongoDB successfully ');
    console.log('MongoDB URI:', mongoUri);

    // Handle connection events with debouncing to reduce noise
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let disconnectTimeout: NodeJS.Timeout | null = null;

    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      // Debounce disconnect messages
      if (disconnectTimeout) clearTimeout(disconnectTimeout);
      disconnectTimeout = setTimeout(() => {
        console.log('MongoDB disconnected');
      }, 2000);
    });

    mongoose.connection.on('reconnected', () => {
      // Debounce reconnect messages
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (disconnectTimeout) clearTimeout(disconnectTimeout);
      reconnectTimeout = setTimeout(() => {
        console.log('MongoDB reconnected');
      }, 2000);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('Database disconnected successfully');
  } catch (error) {
    console.error('Error disconnecting from database:', error);
  }
};
