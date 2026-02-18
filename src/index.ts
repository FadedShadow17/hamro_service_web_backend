import app from './app';
import { connectMongoDB, disconnectMongoDB } from './database/mongodb';
import { env } from './config/env';
import os from 'os';

function getLocalIpAddress(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const nets = interfaces[name];
    if (nets) {
      for (const net of nets) {
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
  }
  return 'localhost';
}

async function startServer() {
  try {
    await connectMongoDB();
    const localIp = getLocalIpAddress();
    app.listen(env.port, '0.0.0.0', () => {
      console.log(`Server is running on port ${env.port}`);
      console.log(`MongoDB connected to: ${env.mongodbUri}`);
      console.log(`\nAPI endpoints available at:`);
      console.log(`  Local: http://localhost:${env.port}/api/auth`);
      console.log(`  LAN: http://${localIp}:${env.port}/api/auth`);
      console.log(`\n⚠️  FIREWALL SETUP REQUIRED:`);
      console.log(`   Please allow port ${env.port} in your firewall settings`);
      console.log(`   Windows: Allow port ${env.port} through Windows Defender Firewall`);
      console.log(`   Mac/Linux: Configure firewall to allow TCP port ${env.port}`);
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
