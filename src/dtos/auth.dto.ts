import { z } from 'zod';
import { USER_ROLES } from '../config/constants';

const nepalPhoneRegex = /^\+977-[0-9]{9,10}$/;

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must not exceed 100 characters'),
  phone: z
    .string()
    .regex(nepalPhoneRegex, 'Phone number must be in format +977-XXXXXXXXX')
    .optional(),
  phoneNumber: z
    .string()
    .regex(nepalPhoneRegex, 'Phone number must be in format +977-XXXXXXXXX')
    .optional(), // Alias for Flutter compatibility
  username: z.string().optional(), // Accept but don't use (for Flutter compatibility)
  role: z.enum([USER_ROLES.USER, USER_ROLES.PROVIDER], {
    errorMap: () => ({ message: `Role must be either "${USER_ROLES.USER}" or "${USER_ROLES.PROVIDER}"` }),
  }).optional(),
}).transform((data) => {

  return {
    ...data,
    phone: data.phone || data.phoneNumber,
  };
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(100, 'Password must not exceed 100 characters'),
});

export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
