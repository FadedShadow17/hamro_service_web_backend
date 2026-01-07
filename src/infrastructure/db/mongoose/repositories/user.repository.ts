import { User, IUser } from '../models/user.model';
import { UserRole } from '../../../../shared/constants';

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string; // Nepal format: +977-XXXXXXXXX
  role: UserRole;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  createUser(userData: CreateUserData): Promise<IUser>;
}

export class UserRepository implements IUserRepository {
  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email: email.toLowerCase().trim() });
  }

  /**
   * Create a new user
   */
  async createUser(userData: CreateUserData): Promise<IUser> {
    const user = new User({
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      passwordHash: userData.passwordHash,
      phone: userData.phone?.trim(),
      role: userData.role,
    });

    return await user.save();
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }
}

