import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IService extends Document {
  categoryId: Types.ObjectId;
  name: string;
  description: string;
  image?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceCategory',
      required: [true, 'Category ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    image: {
      type: String,
      trim: true,
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
serviceSchema.index({ categoryId: 1, active: 1 });

export const Service = mongoose.model<IService>('Service', serviceSchema);

