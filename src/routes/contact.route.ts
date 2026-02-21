import { Router } from 'express';
import { ContactController } from '../controllers/contact.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();
const contactController = new ContactController();

router.post('/', requireAuth, (req, res, next) => contactController.create(req, res, next));

router.get('/me', requireAuth, (req, res, next) => contactController.getMyContacts(req, res, next));

router.get('/', requireAuth, (req, res, next) => contactController.getAllContacts(req, res, next));

router.get('/testimonials', (req, res, next) => contactController.getTestimonials(req, res, next));

export default router;
