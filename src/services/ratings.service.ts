import { RatingRepository, RatingRepositoryImpl } from '../repositories/rating.repository';
import { CreateRatingDTO } from '../dtos/rating.dto';
import { HttpError } from '../errors/http-error';
import { IRating } from '../models/rating.model';
import { BookingRepository } from '../repositories/booking.repository';

export interface RatingResponse {
  id: string;
  bookingId: string;
  userId: string;
  providerId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class RatingsService {
  private ratingRepository: RatingRepository;
  private bookingRepository: BookingRepository;

  constructor() {
    this.ratingRepository = new RatingRepositoryImpl();
    this.bookingRepository = new BookingRepository();
  }

  
  async createRating(userId: string, dto: CreateRatingDTO): Promise<RatingResponse> {

    const booking = await this.bookingRepository.findById(dto.bookingId);
    if (!booking) {
      throw new HttpError(404, 'Booking not found');
    }

    if (booking.userId !== userId) {
      throw new HttpError(403, 'You can only rate bookings that belong to you');
    }

    if (booking.status !== 'COMPLETED') {
      throw new HttpError(400, 'You can only rate completed bookings');
    }

    const existingRating = await this.ratingRepository.findByBookingId(dto.bookingId);
    if (existingRating) {
      throw new HttpError(409, 'Rating already exists for this booking');
    }

    if (booking.providerId && booking.providerId !== dto.providerId) {
      throw new HttpError(400, 'Provider ID does not match the booking');
    }

    const rating = await this.ratingRepository.create({
      bookingId: dto.bookingId,
      userId,
      providerId: dto.providerId,
      rating: dto.rating,
      comment: dto.comment,
    });

    return this.mapToResponse(rating);
  }

  
  async getProviderRatings(providerId: string): Promise<RatingResponse[]> {
    const ratings = await this.ratingRepository.findByProviderId(providerId);
    return ratings.map(this.mapToResponse);
  }

  
  async getUserRatings(userId: string): Promise<RatingResponse[]> {
    const ratings = await this.ratingRepository.findByUserId(userId);
    return ratings.map(this.mapToResponse);
  }

  
  async getRatingForBooking(bookingId: string): Promise<RatingResponse | null> {
    const rating = await this.ratingRepository.findByBookingId(bookingId);
    return rating ? this.mapToResponse(rating) : null;
  }

  
  private mapToResponse(rating: IRating): RatingResponse {
    return {
      id: rating._id.toString(),
      bookingId: rating.bookingId.toString(),
      userId: rating.userId.toString(),
      providerId: rating.providerId.toString(),
      rating: rating.rating,
      comment: rating.comment,
      createdAt: rating.createdAt,
      updatedAt: rating.updatedAt,
    };
  }
}
