import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRating extends Document {
  bookingId: Types.ObjectId;
  userId: Types.ObjectId;
  providerId: Types.ObjectId;
  rating: number; // 1-5 stars
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ratingSchema = new Schema<IRating>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking ID is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'ProviderProfile',
      required: [true, 'Provider ID is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

ratingSchema.index({ bookingId: 1 }, { unique: true });

ratingSchema.index({ providerId: 1, createdAt: -1 });
ratingSchema.index({ userId: 1, createdAt: -1 });

export const Rating = mongoose.model<IRating>('Rating', ratingSchema);
