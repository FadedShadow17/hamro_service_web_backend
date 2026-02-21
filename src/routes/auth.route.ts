import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();

router.post('/register', (req, res, next) => authController.register(req, res, next));

router.post('/login', (req, res, next) => authController.login(req, res, next));

router.get('/me', requireAuth, (req, res, next) => authController.getMe(req, res, next));

router.post('/forgot-password', (req, res) => authController.forgotPassword(req, res));

export default router;
