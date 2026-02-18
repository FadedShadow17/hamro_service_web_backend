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
import professionRoutes from './routes/profession.route';
import serviceProviderRoutes from './routes/service-provider.routes';
import usersRoutes from './routes/users.route';
import paymentsRoutes from './routes/payments.route';
import uploadRoutes from './routes/upload.route';
import { errorHandler } from './middlewares/error-handler';

const app = express();

app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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

app.use('/api/professions', professionRoutes);
app.use('/api/service-provider', serviceProviderRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'hamro-service-backend' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

app.use(errorHandler);

export default app;
