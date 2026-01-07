import mongoose, { Schema, Document, Types } from 'mongoose';
import { KATHMANDU_AREAS, CITY, VERIFICATION_STATUS, PROVIDER_ROLES } from '../../../../shared/constants';

export interface IProviderProfile extends Document {
  userId: Types.ObjectId;
  city: string;
  area: typeof KATHMANDU_AREAS[number];
  phone?: string;
  bio?: string;
  active: boolean;
  // Verification fields
  verificationStatus: typeof VERIFICATION_STATUS[keyof typeof VERIFICATION_STATUS];
  fullName?: string;
  phoneNumber?: string; // Nepal format: +977-XXXXXXXXX
  citizenshipNumber?: string;
  serviceRole?: typeof PROVIDER_ROLES[number]; // Service provider role
  citizenshipFrontImage?: string; // URL to image
  citizenshipBackImage?: string; // URL to image
  profileImage?: string; // URL to image
  selfieImage?: string; // URL to image (optional)
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
    // Verification fields
    verificationStatus: {
      type: String,
      enum: Object.values(VERIFICATION_STATUS),
      default: VERIFICATION_STATUS.NOT_SUBMITTED,
    },
    fullName: {
      type: String,
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^\+977-[0-9]{9,10}$/, 'Phone number must be in format +977-XXXXXXXXX'],
    },
    citizenshipNumber: {
      type: String,
      trim: true,
      maxlength: [20, 'Citizenship number cannot exceed 20 characters'],
    },
    serviceRole: {
      type: String,
      enum: PROVIDER_ROLES,
      trim: true,
    },
    citizenshipFrontImage: {
      type: String,
      trim: true,
    },
    citizenshipBackImage: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      trim: true,
    },
    selfieImage: {
      type: String,
      trim: true,
    },
    address: {
      province: {
        type: String,
        trim: true,
        maxlength: [50, 'Province cannot exceed 50 characters'],
      },
      district: {
        type: String,
        trim: true,
        maxlength: [50, 'District cannot exceed 50 characters'],
      },
      municipality: {
        type: String,
        trim: true,
        maxlength: [100, 'Municipality cannot exceed 100 characters'],
      },
      ward: {
        type: String,
        trim: true,
        maxlength: [10, 'Ward cannot exceed 10 characters'],
      },
      tole: {
        type: String,
        trim: true,
        maxlength: [100, 'Tole cannot exceed 100 characters'],
      },
      street: {
        type: String,
        trim: true,
        maxlength: [100, 'Street cannot exceed 100 characters'],
      },
    },
    verifiedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
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

