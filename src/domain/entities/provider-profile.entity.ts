import { KathmanduArea } from '../../shared/constants';

export interface ProviderProfileEntity {
  id: string;
  userId: string;
  city: string; // Fixed to "Kathmandu"
  area: KathmanduArea;
  phone?: string;
  bio?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

