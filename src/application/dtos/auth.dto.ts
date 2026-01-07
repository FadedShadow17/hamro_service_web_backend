import { z } from 'zod';
import { USER_ROLES } from '../../shared/constants';

// Nepal phone number validation: +977-XXXXXXXXX (9-10 digits)
const nepalPhoneRegex = /^\+977-[0-9]{9,10}$/;

// Register DTO Schema
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
  role: z.enum([USER_ROLES.USER, USER_ROLES.PROVIDER], {
    errorMap: () => ({ message: `Role must be either "${USER_ROLES.USER}" or "${USER_ROLES.PROVIDER}"` }),
  }),
});

// Login DTO Schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(100, 'Password must not exceed 100 characters'),
});

// TypeScript types inferred from schemas
export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;

