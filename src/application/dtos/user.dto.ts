import { z } from 'zod';

// Schema for updating user profile
export const updateUserProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters').optional(),
  phone: z.string().regex(/^\+977-[0-9]{9,10}$/, 'Phone number must be in format +977-XXXXXXXXX').optional().or(z.literal('')),
});

export type UpdateUserProfileDTO = z.infer<typeof updateUserProfileSchema>;

