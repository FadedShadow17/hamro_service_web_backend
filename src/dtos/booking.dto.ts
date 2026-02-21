import { z } from 'zod';
import { KATHMANDU_AREAS } from '../config/constants';

export const createBookingSchema = z.preprocess(
  (data: any) => {

    if (data && typeof data === 'object' && data !== null) {
      const processed = { ...data };
      if ('providerId' in processed) {
        const providerId = processed.providerId;

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
    area: z.enum([...KATHMANDU_AREAS] as [string, ...string[]], {
      errorMap: () => ({ message: 'Invalid area' }),
    }),
  })
);

export type CreateBookingDTO = z.infer<typeof createBookingSchema>;

export const updateBookingStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'DECLINED', 'COMPLETED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Invalid booking status' }),
  }),
});

export type UpdateBookingStatusDTO = z.infer<typeof updateBookingStatusSchema>;

function normalizeTimeSlot(timeSlot: any): string | undefined {
  if (!timeSlot || typeof timeSlot !== 'string') {
    return undefined;
  }

  const trimmed = timeSlot.trim();
  if (!trimmed) {
    return undefined;
  }

  if (/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(trimmed)) {
    return trimmed;
  }

  const rangeMatch = trimmed.match(/^(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?\s*[-–—]\s*(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?/i);
  if (rangeMatch) {

    let hour = parseInt(rangeMatch[1], 10);
    const minute = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : 0;
    const ampm = rangeMatch[3] ? rangeMatch[3].toLowerCase() : (rangeMatch[6] ? rangeMatch[6].toLowerCase() : null);

    if (ampm) {
      if (ampm === 'pm' && hour !== 12) {
        hour += 12;
      } else if (ampm === 'am' && hour === 12) {
        hour = 0;
      }
    }

    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
  }

  const timeMatch = trimmed.match(/(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)/i);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const ampm = timeMatch[3].toLowerCase();

    if (ampm === 'pm' && hour !== 12) {
      hour += 12;
    } else if (ampm === 'am' && hour === 12) {
      hour = 0;
    }

    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
  }

  const directMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (directMatch) {
    const hour = parseInt(directMatch[1], 10);
    const minute = parseInt(directMatch[2], 10);
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
  }

  return trimmed;
}

export const updateBookingSchema = z.preprocess(
  (data: any) => {
    if (data && typeof data === 'object' && data !== null) {
      const processed = { ...data };
      if ('timeSlot' in processed && processed.timeSlot) {
        const normalized = normalizeTimeSlot(processed.timeSlot);
        if (normalized) {
          processed.timeSlot = normalized;
        }
      }
      return processed;
    }
    return data;
  },
  z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
    timeSlot: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Time slot must be in HH:mm format').optional(),
    area: z.enum([...KATHMANDU_AREAS] as [string, ...string[]], {
      errorMap: () => ({ message: 'Invalid area' }),
    }).optional(),
  })
);

export type UpdateBookingDTO = z.infer<typeof updateBookingSchema>;