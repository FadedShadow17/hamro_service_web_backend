// User Roles
export const USER_ROLES = {
  USER: 'user',
  PROVIDER: 'provider',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  DECLINED: 'DECLINED',
  CANCELLED: 'CANCELLED',
} as const;

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

// Kathmandu Areas
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

// City (fixed to Kathmandu)
export const CITY = 'Kathmandu' as const;

// Day of Week (0 = Sunday, 6 = Saturday)
export const DAYS_OF_WEEK = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const;

