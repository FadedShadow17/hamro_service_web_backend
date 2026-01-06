import { UserRole } from '../../shared/constants';

export interface UserEntity {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithPassword extends UserEntity {
  passwordHash: string;
}

