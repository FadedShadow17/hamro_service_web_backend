import { connectMongoDB } from './database/mongodb';
import { env } from './config/env';

async function startServer() {
  try {
    // Connect to MongoDB
    await connectMongoDB();
    
    console.log(`Server is ready. MongoDB connected to: ${env.mongodbUri}`);
    // Server setup will be added in later steps
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});

startServer();

