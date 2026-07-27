import mongoose from 'mongoose';
import { logger } from './utils/logger.js';

export async function connectDB(uri: string): Promise<void> {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
  mongoose.connection.on('error', (err) => logger.error('MongoDB connection error', err));

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10_000,
    maxPoolSize: 10,
  });
}

export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
}
