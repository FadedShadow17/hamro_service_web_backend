import { Router } from 'express';
import { NotificationsController } from '../controllers/notifications.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();
const notificationsController = new NotificationsController();

router.get('/', requireAuth, (req, res, next) =>
  notificationsController.getNotifications(req, res, next)
);

router.patch('/:id/read', requireAuth, (req, res, next) =>
  notificationsController.markAsRead(req, res, next)
);

router.get('/unread-count', requireAuth, (req, res, next) =>
  notificationsController.getUnreadCount(req, res, next)
);

router.patch('/mark-all-read', requireAuth, (req, res, next) =>
  notificationsController.markAllAsRead(req, res, next)
);

export default router;
