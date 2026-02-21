import { z } from 'zod';

export const payForBookingSchema = z.object({
  paymentMethod: z.enum(['COD', 'ONLINE', 'ESEWA', 'FONEPAY']).optional(),
});

export type PayForBookingDTO = z.infer<typeof payForBookingSchema>;
