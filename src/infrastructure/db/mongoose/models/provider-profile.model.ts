import mongoose, { Schema, Document, Types } from 'mongoose';
import { KATHMANDU_AREAS, CITY } from '../../../../shared/constants';

export interface IProviderProfile extends Document {
  userId: Types.ObjectId;
  city: string;
  area: typeof KATHMANDU_AREAS[number];
  phone?: string;
  bio?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const providerProfileSchema = new Schema<IProviderProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },
    city: {
      type: String,
      required: true,
      default: CITY,
      enum: [CITY],
    },
    area: {
      type: String,
      required: [true, 'Area is required'],
      enum: KATHMANDU_AREAS,
    },
    phone: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
providerProfileSchema.index({ userId: 1 });
providerProfileSchema.index({ area: 1, active: 1 });

export const ProviderProfile = mongoose.model<IProviderProfile>('ProviderProfile', providerProfileSchema);

