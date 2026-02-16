import mongoose, { Schema, Document, Types } from 'mongoose';
import { BOOKING_STATUS, KATHMANDU_AREAS } from '../config/constants';

export interface IBooking extends Document {
  userId: Types.ObjectId;
  providerId?: Types.ObjectId | null; // Optional - booking can be created without provider
  serviceId: Types.ObjectId;
  date: string; // Format: "YYYY-MM-DD"
  timeSlot: string; // Format: "HH:mm"
  area: typeof KATHMANDU_AREAS[number];
  status: typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];
  paymentStatus?: 'UNPAID' | 'PAID'; // Payment status
  paidAt?: Date; // Date when payment was made
  paymentMethod?: 'COD' | 'ONLINE' | 'ESEWA' | 'FONEPAY'; // Payment method used
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'ProviderProfile',
      required: false, // Optional - allow bookings without provider
      default: null,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service ID is required'],
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Time slot must be in HH:mm format'],
    },
    area: {
      type: String,
      required: [true, 'Area is required'],
      enum: KATHMANDU_AREAS,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
    },
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PAID'],
      default: 'UNPAID',
    },
    paidAt: {
      type: Date,
      required: false,
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'ONLINE', 'ESEWA', 'FONEPAY'],
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Unique constraint: prevent double bookings (same provider, date, and time slot)
// Only apply when providerId exists
bookingSchema.index({ providerId: 1, date: 1, timeSlot: 1 }, { unique: true, sparse: true });

// Indexes for faster queries
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ providerId: 1, status: 1 });
bookingSchema.index({ date: 1, status: 1 });

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
