import { Router } from 'express';
import { ServiceProviderController } from '../controllers/service-provider.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { userUpload } from '../services/upload.service';
import { USER_ROLES } from '../config/constants';

const router = Router();
const controller = new ServiceProviderController();


const requireServiceProvider = [
    requireAuth,
    requireRole(USER_ROLES.SERVICE_PROVIDER)
];


router.get('/users', ...requireServiceProvider, (req, res, next) => controller.getUsers(req, res, next));

router.get('/users/:id', ...requireServiceProvider, (req, res, next) => controller.getUser(req, res, next));

router.post('/users', ...requireServiceProvider, userUpload.single('image'), (req, res, next) => controller.createUser(req, res, next));

router.put('/users/:id', ...requireServiceProvider, userUpload.single('image'), (req, res, next) => controller.updateUser(req, res, next));

router.delete('/users/:id', ...requireServiceProvider, (req, res, next) => controller.deleteUser(req, res, next));

export default router;
