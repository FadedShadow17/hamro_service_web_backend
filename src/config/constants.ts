
export const USER_ROLES = {
  USER: 'user',
  PROVIDER: 'provider',
  SERVICE_PROVIDER: 'service_provider',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  DECLINED: 'DECLINED',
  CANCELLED: 'CANCELLED',
} as const;

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

export const KATHMANDU_AREAS = [
  'Baneshwor',
  'Koteshwor',
  'Kalanki',
  'Balaju',
  'Boudha',
  'Kalimati',
  'New Road',
  'Thamel',
  'Chabahil',
  'Maharajgunj',
] as const;

export type KathmanduArea = typeof KATHMANDU_AREAS[number];

export const CITY = 'Kathmandu' as const;

export const DAYS_OF_WEEK = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const;

export const VERIFICATION_STATUS = {
  NOT_SUBMITTED: 'not_submitted',
  PENDING: 'pending',
  VERIFIED: 'verified',
} as const;

export type VerificationStatus = typeof VERIFICATION_STATUS[keyof typeof VERIFICATION_STATUS];

export const PROVIDER_ROLES = [
  'Plumber',
  'Electrician',
  'Cleaner',
  'Carpenter',
  'Painter',
  'HVAC Technician',
  'Appliance Repair Technician',
  'Gardener/Landscaper',
  'Pest Control Specialist',
  'Water Tank Cleaner',
] as const;

export type ProviderRole = typeof PROVIDER_ROLES[number];
