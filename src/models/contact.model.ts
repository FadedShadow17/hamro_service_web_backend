import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: 'General' | 'Booking' | 'Payments' | 'Technical' | 'Other' | 'Testimonial';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  approved?: boolean; // For testimonials - whether to show publicly
  rating?: number; // For testimonials - star rating (1-5)
  adminReply?: string;
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new Schema<IContact>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      enum: ['General', 'Booking', 'Payments', 'Technical', 'Other', 'Testimonial'],
      default: 'General',
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'closed'],
      default: 'open',
    },
    approved: {
      type: Boolean,
      default: false, // Testimonials need approval before showing publicly
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    adminReply: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
contactSchema.index({ userId: 1, createdAt: -1 });
contactSchema.index({ status: 1 });
contactSchema.index({ category: 1, approved: 1 }); // For testimonials query

export const Contact = mongoose.model<IContact>('Contact', contactSchema);

