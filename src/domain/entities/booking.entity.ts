import { BookingStatus, KathmanduArea } from '../../shared/constants';

export interface BookingEntity {
  id: string;
  userId: string;
  providerId: string;
  serviceId: string;
  date: string; // Format: "YYYY-MM-DD"
  timeSlot: string; // Format: "HH:mm" (e.g., "09:00")
  area: KathmanduArea;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

