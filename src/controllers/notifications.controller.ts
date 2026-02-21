import { Response, NextFunction } from 'express';
import { NotificationRepository } from '../repositories/notification.repository';
import { ProviderProfileRepository } from '../repositories/provider-profile.repository';
import { AuthRequest } from '../middlewares/auth.middleware';
import { USER_ROLES } from '../config/constants';

export class NotificationsController {
  async getNotifications(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const notificationRepository = new NotificationRepository();
      let notifications;

      if (req.user.role === USER_ROLES.PROVIDER) {
        const providerProfileRepo = new ProviderProfileRepository();
        const profile = await providerProfileRepo.findByUserId(req.user.id);
        if (!profile) {
          res.status(404).json({ message: 'Provider profile not found' });
          return;
        }
        notifications = await notificationRepository.findByProviderId(profile.id);
      } else {
        notifications = await notificationRepository.findByUserId(req.user.id);
      }

      res.status(200).json({ notifications });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const notificationRepository = new NotificationRepository();
      const notification = await notificationRepository.markAsRead(id);

      if (!notification) {
        res.status(404).json({ message: 'Notification not found' });
        return;
      }

      res.status(200).json({ notification });
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const notificationRepository = new NotificationRepository();
      let count;

      if (req.user.role === USER_ROLES.PROVIDER) {
        const providerProfileRepo = new ProviderProfileRepository();
        const profile = await providerProfileRepo.findByUserId(req.user.id);
        if (!profile) {
          res.status(200).json({ count: 0 });
          return;
        }
        count = await notificationRepository.getUnreadCount(undefined, profile.id);
      } else {
        count = await notificationRepository.getUnreadCount(req.user.id);
      }

      res.status(200).json({ count });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const notificationRepository = new NotificationRepository();

      if (req.user.role === USER_ROLES.PROVIDER) {
        const providerProfileRepo = new ProviderProfileRepository();
        const profile = await providerProfileRepo.findByUserId(req.user.id);
        if (!profile) {
          res.status(404).json({ message: 'Provider profile not found' });
          return;
        }
        await notificationRepository.markAllAsRead(undefined, profile.id);
      } else {
        await notificationRepository.markAllAsRead(req.user.id);
      }

      res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  }
}
