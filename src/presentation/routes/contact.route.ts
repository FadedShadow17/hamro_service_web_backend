import { Router } from 'express';
import { ContactController } from '../controllers/contact.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();
const contactController = new ContactController();

// POST /api/v1/contact - Create contact message (requires auth)
router.post('/', requireAuth, (req, res, next) => contactController.create(req, res, next));

// GET /api/v1/contact/me - Get logged-in user's contact messages (requires auth)
router.get('/me', requireAuth, (req, res, next) => contactController.getMyContacts(req, res, next));

// GET /api/v1/contact - Get all contact messages (requires auth, admin in production)
router.get('/', requireAuth, (req, res, next) => contactController.getAllContacts(req, res, next));

export default router;

