import { z } from 'zod';

// Pay for booking DTO
export const payForBookingSchema = z.object({
  paymentMethod: z.enum(['COD', 'ONLINE']).optional(),
});

export type PayForBookingDTO = z.infer<typeof payForBookingSchema>;

