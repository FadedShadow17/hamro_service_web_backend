import { z } from 'zod';
import { VERIFICATION_STATUS, PROVIDER_ROLES } from '../config/constants';

// Nepal phone number validation: +977-XXXXXXXXX (9-10 digits)
const nepalPhoneRegex = /^\+977-[0-9]{9,10}$/;

export const submitVerificationSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters'),
  phoneNumber: z
    .string()
    .regex(nepalPhoneRegex, 'Phone number must be in format +977-XXXXXXXXX'),
  citizenshipNumber: z
    .string()
    .min(1, 'Citizenship number is required')
    .max(20, 'Citizenship number cannot exceed 20 characters'),
  serviceRole: z.enum([...PROVIDER_ROLES] as [string, ...string[]], {
    errorMap: () => ({ message: 'Please select a valid service role' }),
  }),
  address: z.object({
    province: z.string().min(1, 'Province is required').max(50, 'Province cannot exceed 50 characters'),
    district: z.string().min(1, 'District is required').max(50, 'District cannot exceed 50 characters'),
    municipality: z.string().min(1, 'Municipality is required').max(100, 'Municipality cannot exceed 100 characters'),
    ward: z.string().min(1, 'Ward is required').max(10, 'Ward cannot exceed 10 characters'),
    tole: z.string().max(100, 'Tole cannot exceed 100 characters').optional(),
    street: z.string().max(100, 'Street cannot exceed 100 characters').optional(),
  }),
  citizenshipFrontImage: z.string().nullish(),
  citizenshipBackImage: z.string().nullish(),
  profileImage: z.string().nullish(),
  selfieImage: z.string().nullish(),
});

export type SubmitVerificationDTO = z.infer<typeof submitVerificationSchema>;

export const reviewVerificationSchema = z.object({
  status: z.enum([VERIFICATION_STATUS.APPROVED, VERIFICATION_STATUS.REJECTED] as [string, string]),
  rejectionReason: z.string().max(500, 'Rejection reason cannot exceed 500 characters').optional(),
});

export type ReviewVerificationDTO = z.infer<typeof reviewVerificationSchema>;
