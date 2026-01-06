export interface TimeSlot {
  start: string; // Format: "HH:mm" (e.g., "09:00")
  end: string; // Format: "HH:mm" (e.g., "17:00")
}

export interface AvailabilityEntity {
  id: string;
  providerId: string;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  timeSlots: TimeSlot[];
  createdAt: Date;
  updatedAt: Date;
}

