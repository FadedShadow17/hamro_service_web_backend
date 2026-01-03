import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

// POST /api/auth/register
router.post('/register', (req, res, next) => authController.register(req, res, next));

// POST /api/auth/login
router.post('/login', (req, res, next) => authController.login(req, res, next));

// POST /api/auth/forgot-password (optional - placeholder)
router.post('/forgot-password', (req, res) => authController.forgotPassword(req, res));

export default router;

