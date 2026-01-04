import { User, IUser } from '../models/user.model';

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'service provider';
}

export class UserRepository {
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

