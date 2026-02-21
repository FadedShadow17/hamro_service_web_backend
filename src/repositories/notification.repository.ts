import mongoose from 'mongoose';
import { Notification, INotification } from '../models/notification.model';
import { NotificationEntity } from '../types/notification.entity';

export interface INotificationRepository {
  create(data: Omit<NotificationEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotificationEntity>;
  findByUserId(userId: string): Promise<NotificationEntity[]>;
  findByProviderId(providerId: string): Promise<NotificationEntity[]>;
  markAsRead(id: string): Promise<NotificationEntity | null>;
  getUnreadCount(userId?: string, providerId?: string): Promise<number>;
  markAllAsRead(userId?: string, providerId?: string): Promise<void>;
}

export class NotificationRepository implements INotificationRepository {
  async create(data: Omit<NotificationEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotificationEntity> {
    const notificationData: any = {
      type: data.type,
      title: data.title,
      message: data.message,
      read: data.read,
    };
    
    if (data.bookingId) {
      notificationData.bookingId = new mongoose.Types.ObjectId(data.bookingId);
    }
    if (data.userId) {
      notificationData.userId = new mongoose.Types.ObjectId(data.userId);
    }
    if (data.providerId) {
      notificationData.providerId = new mongoose.Types.ObjectId(data.providerId);
    }

    const notification = new Notification(notificationData);
    const saved = await notification.save();
    return this.mapToEntity(saved);
  }

  async findByUserId(userId: string): Promise<NotificationEntity[]> {
    const notifications = await Notification.find({ userId: new mongoose.Types.ObjectId(userId) })
      .populate('bookingId')
      .sort({ createdAt: -1 });
    return notifications.map(this.mapToEntity);
  }

  async findByProviderId(providerId: string): Promise<NotificationEntity[]> {
    const notifications = await Notification.find({ providerId: new mongoose.Types.ObjectId(providerId) })
      .populate('bookingId')
      .sort({ createdAt: -1 });
    return notifications.map(this.mapToEntity);
  }

  async markAsRead(id: string): Promise<NotificationEntity | null> {
    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    ).populate('bookingId');
    return notification ? this.mapToEntity(notification) : null;
  }

  async getUnreadCount(userId?: string, providerId?: string): Promise<number> {
    const query: any = { read: false };
    if (userId) {
      query.userId = new mongoose.Types.ObjectId(userId);
    }
    if (providerId) {
      query.providerId = new mongoose.Types.ObjectId(providerId);
    }
    return await Notification.countDocuments(query);
  }

  async markAllAsRead(userId?: string, providerId?: string): Promise<void> {
    const query: any = { read: false };
    if (userId) {
      query.userId = new mongoose.Types.ObjectId(userId);
    }
    if (providerId) {
      query.providerId = new mongoose.Types.ObjectId(providerId);
    }
    await Notification.updateMany(query, { read: true });
  }

  private mapToEntity(notification: INotification): NotificationEntity {
    return {
      id: notification._id.toString(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      bookingId: notification.bookingId ? notification.bookingId.toString() : null,
      userId: notification.userId ? notification.userId.toString() : null,
      providerId: notification.providerId ? notification.providerId.toString() : null,
      read: notification.read,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }
}
