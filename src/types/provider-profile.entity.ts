import { KathmanduArea, VerificationStatus, ProviderRole } from '../config/constants';

export interface ProviderProfileEntity {
  id: string;
  userId: string;
  city: string; // Fixed to "Kathmandu"
  area: KathmanduArea;
  phone?: string;
  bio?: string;
  active: boolean;
  // Verification fields
  verificationStatus: VerificationStatus;
  fullName?: string;
  phoneNumber?: string;
  citizenshipNumber?: string;
  serviceRole?: ProviderRole;
  citizenshipFrontImage?: string;
  citizenshipBackImage?: string;
  profileImage?: string;
  selfieImage?: string;
  address?: {
    province: string;
    district: string;
    municipality: string;
    ward: string;
    tole?: string;
    street?: string;
  };
  verifiedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
