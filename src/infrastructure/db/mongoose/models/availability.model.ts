import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITimeSlot {
  start: string; // Format: "HH:mm"
  end: string; // Format: "HH:mm"
}

export interface IAvailability extends Document {
  providerId: Types.ObjectId;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  timeSlots: ITimeSlot[];
  createdAt: Date;
  updatedAt: Date;
}

const timeSlotSchema = new Schema<ITimeSlot>(
  {
    start: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:mm format'],
    },
    end: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:mm format'],
    },
  },
  { _id: false }
);

const availabilitySchema = new Schema<IAvailability>(
  {
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'ProviderProfile',
      required: [true, 'Provider ID is required'],
    },
    dayOfWeek: {
      type: Number,
      required: [true, 'Day of week is required'],
      min: [0, 'Day of week must be between 0 and 6'],
      max: [6, 'Day of week must be between 0 and 6'],
    },
    timeSlots: {
      type: [timeSlotSchema],
      required: [true, 'Time slots are required'],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Unique constraint: one availability record per provider per day
availabilitySchema.index({ providerId: 1, dayOfWeek: 1 }, { unique: true });
availabilitySchema.index({ providerId: 1 });

export const Availability = mongoose.model<IAvailability>('Availability', availabilitySchema);

