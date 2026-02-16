import app from './app';
import { connectMongoDB, disconnectMongoDB } from './database/mongodb';
import { env } from './config/env';

async function startServer() {
  try {
    await connectMongoDB();
    // Listen on all network interfaces (0.0.0.0) to allow physical devices to connect
    app.listen(env.port, '0.0.0.0', () => {
      console.log(`Server is running on port ${env.port}`);
      console.log(`MongoDB connected to: ${env.mongodbUri}`);
      console.log(`API endpoints available at:`);
      console.log(`  - http://localhost:${env.port}/api/auth`);
      console.log(`  - http://192.168.1.80:${env.port}/api/auth (for physical devices on same network)`);
      console.log(`\nMake sure your device is on the same WiFi network!`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

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
