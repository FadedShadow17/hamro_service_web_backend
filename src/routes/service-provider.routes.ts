import { Router } from 'express';
import { ServiceProviderController } from '../controllers/service-provider.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { userUpload } from '../services/upload.service';
import { USER_ROLES } from '../config/constants';

const router = Router();
const controller = new ServiceProviderController();

// Shared middleware for all routes
// Routes are protected for Service Providers only
const requireServiceProvider = [
    requireAuth,
    requireRole(USER_ROLES.SERVICE_PROVIDER)
];

// Routes
// GET /api/service-provider/users - Fetch users visible to service provider
router.get('/users', ...requireServiceProvider, (req, res, next) => controller.getUsers(req, res, next));

// GET /api/service-provider/users/:id - Fetch single user
router.get('/users/:id', ...requireServiceProvider, (req, res, next) => controller.getUser(req, res, next));

// POST /api/service-provider/users - Create a user
router.post('/users', ...requireServiceProvider, userUpload.single('image'), (req, res, next) => controller.createUser(req, res, next));

// PUT /api/service-provider/users/:id - Update user data
router.put('/users/:id', ...requireServiceProvider, userUpload.single('image'), (req, res, next) => controller.updateUser(req, res, next));

// DELETE /api/service-provider/users/:id - Delete user
router.delete('/users/:id', ...requireServiceProvider, (req, res, next) => controller.deleteUser(req, res, next));

export default router;
