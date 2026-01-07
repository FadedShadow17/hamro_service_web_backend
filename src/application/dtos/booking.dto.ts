import { z } from 'zod';
import { KATHMANDU_AREAS } from '../../shared/constants';

export const createBookingSchema = z.preprocess(
  (data: any) => {
    // Handle providerId: convert empty string, null, or undefined to undefined and remove from object
    if (data && typeof data === 'object' && data !== null) {
      const processed = { ...data };
      if ('providerId' in processed) {
        const providerId = processed.providerId;
        // Remove if empty string, null, undefined, or whitespace-only
        if (!providerId || (typeof providerId === 'string' && providerId.trim() === '')) {
          delete processed.providerId;
        }
      }
      return processed;
    }
    return data;
  },
  z.object({
    providerId: z.string().min(1).optional(), // Made optional - will be auto-assigned if not provided
    serviceId: z.string().min(1, 'Service ID is required'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    timeSlot: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Time slot must be in HH:mm format'),
    area: z.enum(KATHMANDU_AREAS as [string, ...string[]], {
      errorMap: () => ({ message: 'Invalid area' }),
    }),
  })
);

export type CreateBookingDTO = z.infer<typeof createBookingSchema>;

// Update booking status DTO
export const updateBookingStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'DECLINED', 'COMPLETED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Invalid booking status' }),
  }),
});

export type UpdateBookingStatusDTO = z.infer<typeof updateBookingStatusSchema>;

