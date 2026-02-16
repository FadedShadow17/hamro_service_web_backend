import { UserRole } from '../config/constants';

export interface UserEntity {
  _id?: string; // MongoDB _id for Flutter compatibility
  id: string;
  name: string;
  fullName?: string; // Alias for name (Flutter compatibility)
  email: string;
  phone?: string; // Nepal format: +977-XXXXXXXXX
  phoneNumber?: string; // Alias for phone (Flutter compatibility)
  profileImageUrl?: string; // URL to profile image
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithPassword extends UserEntity {
  passwordHash: string;
}
