import express from 'express';
import cors from 'cors';
import { connectMongoDB, disconnectMongoDB } from './database/mongodb';
import { env } from './config/env';
import authRoutes from './routes/auth.route';
import contactRoutes from './routes/contact.route';
import { errorHandler } from './middleware/error-handler';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/v1/contact', contactRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handler middleware (must be last)
app.use(errorHandler);

async function startServer() {
  try {
    // Connect to MongoDB
    await connectMongoDB();
    
    // Start Express server
    app.listen(env.port, () => {
      console.log(`Server is running on port ${env.port}`);
      console.log(`MongoDB connected to: ${env.mongodbUri}`);
      console.log(`API endpoints available at http://localhost:${env.port}/api/auth`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await disconnectMongoDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await disconnectMongoDB();
  process.exit(0);
});

startServer();

