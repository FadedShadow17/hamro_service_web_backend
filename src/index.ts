import express from 'express';
import cors from 'cors';
import path from 'path';
import { connectMongoDB, disconnectMongoDB } from './infrastructure/db/mongodb';
import { env } from './config/env';
import authRoutes from './presentation/routes/auth.route';
import contactRoutes from './presentation/routes/contact.route';
import servicesRoutes from './presentation/routes/services.route';
import serviceCategoriesRoutes from './presentation/routes/service-categories.route';
import availabilityRoutes from './presentation/routes/availability.route';
import bookingsRoutes from './presentation/routes/bookings.route';
import providerBookingsRoutes from './presentation/routes/provider-bookings.route';
import providerVerificationRoutes from './presentation/routes/provider-verification.route';
import usersRoutes from './presentation/routes/users.route';
import { errorHandler } from './presentation/middlewares/error-handler';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/service-categories', serviceCategoriesRoutes);
app.use('/api/provider', availabilityRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/provider/bookings', providerBookingsRoutes);
app.use('/api/provider/verification', providerVerificationRoutes);
app.use('/api/users', usersRoutes);

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
