import { Rating, IRating } from '../models/rating.model';
import mongoose, { Types } from 'mongoose';

export interface RatingRepository {
  create(data: {
    bookingId: string;
    userId: string;
    providerId: string;
    rating: number;
    comment?: string;
  }): Promise<IRating>;
  findByBookingId(bookingId: string): Promise<IRating | null>;
  findByProviderId(providerId: string): Promise<IRating[]>;
  findByUserId(userId: string): Promise<IRating[]>;
}

export class RatingRepositoryImpl implements RatingRepository {
  async create(data: {
    bookingId: string;
    userId: string;
    providerId: string;
    rating: number;
    comment?: string;
  }): Promise<IRating> {
    const rating = new Rating({
      bookingId: new Types.ObjectId(data.bookingId),
      userId: new Types.ObjectId(data.userId),
      providerId: new Types.ObjectId(data.providerId),
      rating: data.rating,
      comment: data.comment,
    });
    
    return await rating.save();
  }

  async findByBookingId(bookingId: string): Promise<IRating | null> {
    return await Rating.findOne({ bookingId: new Types.ObjectId(bookingId) })
      .populate('userId', 'name email')
      .populate('providerId')
      .populate('bookingId')
      .exec();
  }

  async findByProviderId(providerId: string): Promise<IRating[]> {
    return await Rating.find({ providerId: new Types.ObjectId(providerId) })
      .populate('userId', 'name email')
      .populate('bookingId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUserId(userId: string): Promise<IRating[]> {
    return await Rating.find({ userId: new Types.ObjectId(userId) })
      .populate('providerId')
      .populate('bookingId')
      .sort({ createdAt: -1 })
      .exec();
  }
}
