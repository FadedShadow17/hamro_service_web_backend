import mongoose, { Schema, Document } from 'mongoose';

export interface IProfession extends Document {
  name: string;
  description?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const professionSchema = new Schema<IProfession>(
  {
    name: {
      type: String,
      required: [true, 'Profession name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Profession name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
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


professionSchema.index({ active: 1 });

export const Profession = mongoose.model<IProfession>('Profession', professionSchema);
