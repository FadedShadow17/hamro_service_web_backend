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
  phone?: string; // Will be populated from User model
}

export interface ProviderInfo {
  id: string;
  fullName?: string; // From ProviderProfile verification
  serviceRole?: string; // From ProviderProfile
  phone?: string; // From ProviderProfile
}

export interface BookingEntity {
  id: string;
  userId: string;
  providerId?: string | null; // Optional - booking can exist without provider
  serviceId: string;
  service?: ServiceInfo; // Service details when populated
  user?: UserInfo; // User details when populated (for provider dashboard)
  provider?: ProviderInfo; // Provider details when populated (for user dashboard)
  date: string; // Format: "YYYY-MM-DD"
  timeSlot: string; // Format: "HH:mm" (e.g., "09:00")
  area: KathmanduArea;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

