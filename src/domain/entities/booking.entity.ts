import { BookingStatus, KathmanduArea } from '../../shared/constants';

export interface ServiceInfo {
  id: string;
  name: string;
  description?: string;
  basePrice?: number;
}

export interface BookingEntity {
  id: string;
  userId: string;
  providerId: string;
  serviceId: string;
  service?: ServiceInfo; // Service details when populated
  date: string; // Format: "YYYY-MM-DD"
  timeSlot: string; // Format: "HH:mm" (e.g., "09:00")
  area: KathmanduArea;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

