import mongoose, { Schema, Document } from 'mongoose';
import { USER_ROLES, type UserRole } from '../../../../shared/constants';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string; // Nepal format: +977-XXXXXXXXX
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+977-[0-9]{9,10}$/, 'Phone number must be in format +977-XXXXXXXXX'],
    },
    role: {
      type: String,
      enum: [...Object.values(USER_ROLES), 'service provider'], // Allow 'service provider' for backward compatibility
      default: USER_ROLES.USER,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', userSchema);

