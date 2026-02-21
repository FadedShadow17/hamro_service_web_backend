import { User, IUser } from '../models/user.model';
import { UserRole } from '../config/constants';

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
  updateUser(id: string, userData: Partial<Omit<CreateUserData, 'passwordHash'>>): Promise<IUser | null>;
}

export class UserRepository implements IUserRepository {
  
  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email: email.toLowerCase().trim() });
  }

  
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

  
  async findById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  
  async updateUser(id: string, userData: Partial<Omit<CreateUserData, 'passwordHash'> & { profileImageUrl?: string }>): Promise<IUser | null> {
    const updateData: any = {};
    if (userData.name !== undefined) updateData.name = userData.name.trim();
    if (userData.email !== undefined) updateData.email = userData.email.toLowerCase().trim();
    if (userData.phone !== undefined) updateData.phone = userData.phone?.trim();
    if (userData.role !== undefined) updateData.role = userData.role;
    if (userData.profileImageUrl !== undefined) updateData.profileImageUrl = userData.profileImageUrl?.trim();
    
    const updated = await User.findByIdAndUpdate(id, updateData, { new: true });
    return updated;
  }
}
