import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.route';
import contactRoutes from './routes/contact.route';
import servicesRoutes from './routes/services.route';
import serviceCategoriesRoutes from './routes/service-categories.route';
import availabilityRoutes from './routes/availability.route';
import bookingsRoutes from './routes/bookings.route';
import providerBookingsRoutes from './routes/provider-bookings.route';
import providerDashboardRoutes from './routes/provider-dashboard.route';
import providerVerificationRoutes from './routes/provider-verification.route';
import { ProviderVerificationController } from './controllers/provider-verification.controller';
import { requireAuth, requireRole } from './middlewares/auth.middleware';
import { USER_ROLES } from './config/constants';
import serviceProviderRoutes from './routes/service-provider.routes';
import usersRoutes from './routes/users.route';
import paymentsRoutes from './routes/payments.route';
import { errorHandler } from './middlewares/error-handler';

const app = express();

// CORS configuration - Allow requests from mobile devices and web
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      // Allow any local network IP (for physical devices)
      /^http:\/\/192\.168\.\d+\.\d+:\d+$/,
      /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,
      /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+:\d+$/,
    ];
    
    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      // For development, allow all origins (remove in production)
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/service-categories', serviceCategoriesRoutes);
app.use('/api/provider', availabilityRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/provider/bookings', providerBookingsRoutes);
app.use('/api/provider/dashboard', providerDashboardRoutes);
app.use('/api/provider/verification', providerVerificationRoutes);

// Additional route for /api/provider/me/verification (frontend expects this path)
const verificationController = new ProviderVerificationController();
app.get(
  '/api/provider/me/verification',
  requireAuth,
  requireRole(USER_ROLES.PROVIDER),
  (req, res, next) => verificationController.getVerificationSummary(req, res, next)
);

app.use('/api/service-provider', serviceProviderRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/payments', paymentsRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

app.use(errorHandler);

export default app;
