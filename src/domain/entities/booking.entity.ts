import { BookingStatus, KathmanduArea } from '../../shared/constants';

export interface ServiceInfo {
  id: string;
  name: string;
  description?: string;
  basePrice?: number;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  phone?: string; // Will be populated from ProviderProfile if available
}

export interface BookingEntity {
  id: string;
  userId: string;
  providerId?: string | null; // Optional - booking can exist without provider
  serviceId: string;
  service?: ServiceInfo; // Service details when populated
  user?: UserInfo; // User details when populated (for provider dashboard)
  date: string; // Format: "YYYY-MM-DD"
  timeSlot: string; // Format: "HH:mm" (e.g., "09:00")
  area: KathmanduArea;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

