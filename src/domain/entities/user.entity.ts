import { UserRole } from '../../shared/constants';

export interface UserEntity {
  id: string;
  name: string;
  email: string;
  phone?: string; // Nepal format: +977-XXXXXXXXX
  profileImageUrl?: string; // URL to profile image
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithPassword extends UserEntity {
  passwordHash: string;
}

