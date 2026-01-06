import { z } from 'zod';
import { KATHMANDU_AREAS } from '../../shared/constants';

export const createBookingSchema = z.object({
  providerId: z.string().min(1, 'Provider ID is required'),
  serviceId: z.string().min(1, 'Service ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  timeSlot: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Time slot must be in HH:mm format'),
  area: z.enum(KATHMANDU_AREAS as [string, ...string[]], {
    errorMap: () => ({ message: 'Invalid area' }),
  }),
});

export type CreateBookingDTO = z.infer<typeof createBookingSchema>;

