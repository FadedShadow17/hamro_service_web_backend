import { z } from 'zod';

export const createRatingSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  providerId: z.string().min(1, 'Provider ID is required'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().max(1000, 'Comment cannot exceed 1000 characters').optional(),
});

export type CreateRatingDTO = z.infer<typeof createRatingSchema>;
