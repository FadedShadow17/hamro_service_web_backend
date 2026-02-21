export interface NotificationEntity {
  id: string;
  type: string;
  title: string;
  message: string;
  bookingId?: string | null;
  userId?: string | null;
  providerId?: string | null;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}
