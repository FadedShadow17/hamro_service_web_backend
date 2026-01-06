import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProviderService extends Document {
  providerId: Types.ObjectId;
  serviceId: Types.ObjectId;
  price: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const providerServiceSchema = new Schema<IProviderService>(
  {
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'ProviderProfile',
      required: [true, 'Provider ID is required'],
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service ID is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
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

// Unique constraint: one provider can only have one active service offering per service
providerServiceSchema.index({ providerId: 1, serviceId: 1 }, { unique: true });
providerServiceSchema.index({ serviceId: 1, active: 1 });

export const ProviderService = mongoose.model<IProviderService>('ProviderService', providerServiceSchema);

