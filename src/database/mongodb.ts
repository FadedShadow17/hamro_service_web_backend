import mongoose from 'mongoose';
import { env } from '../config/env';

let isConnected = false;

export async function connectMongoDB(): Promise<void> {
  if (isConnected) {
    console.log('MongoDB is already connected');
    return;
  }

  try {
    await mongoose.connect(env.mongodbUri);
    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    isConnected = false;
    throw error;
  }
}

export async function disconnectMongoDB(): Promise<void> {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
    throw error;
  }
}

// Handle connection events
mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  isConnected = false;
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
  isConnected = true;
});

