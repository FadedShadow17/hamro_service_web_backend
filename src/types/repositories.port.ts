import { ServiceCategoryEntity } from './service-category.entity';
import { ServiceEntity } from './service.entity';
import { ProviderProfileEntity } from './provider-profile.entity';
import { ProviderServiceEntity } from './provider-service.entity';
import { AvailabilityEntity, TimeSlot } from './availability.entity';
import { BookingEntity } from './booking.entity';
import { BookingStatus } from '../config/constants';

// ServiceCategory Repository
export interface IServiceCategoryRepository {
  findAll(active?: boolean): Promise<ServiceCategoryEntity[]>;
  findById(id: string): Promise<ServiceCategoryEntity | null>;
  create(data: Omit<ServiceCategoryEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceCategoryEntity>;
}

// Service Repository
export interface IServiceRepository {
  findAll(active?: boolean): Promise<ServiceEntity[]>;
  findById(id: string): Promise<ServiceEntity | null>;
  findBySlug(slug: string): Promise<ServiceEntity | null>;
  findByCategoryId(categoryId: string, active?: boolean): Promise<ServiceEntity[]>; // Deprecated but kept for backward compatibility
  create(data: Omit<ServiceEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceEntity>;
}

// ProviderProfile Repository
export interface IProviderProfileRepository {
  findByUserId(userId: string): Promise<ProviderProfileEntity | null>;
  findById(id: string): Promise<ProviderProfileEntity | null>;
  findByArea(area: string, active?: boolean): Promise<ProviderProfileEntity[]>;
  findAll(active?: boolean): Promise<ProviderProfileEntity[]>;
  create(data: Omit<ProviderProfileEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProviderProfileEntity>;
  update(id: string, data: Partial<Omit<ProviderProfileEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ProviderProfileEntity | null>;
}

// ProviderService Repository
export interface IProviderServiceRepository {
  findByProviderId(providerId: string, active?: boolean): Promise<ProviderServiceEntity[]>;
  findByServiceId(serviceId: string, active?: boolean): Promise<ProviderServiceEntity[]>;
  findByProviderAndService(providerId: string, serviceId: string): Promise<ProviderServiceEntity | null>;
  create(data: Omit<ProviderServiceEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProviderServiceEntity>;
}

// Availability Repository
export interface IAvailabilityRepository {
  findByProviderId(providerId: string): Promise<AvailabilityEntity[]>;
  findByProviderAndDay(providerId: string, dayOfWeek: number): Promise<AvailabilityEntity | null>;
  create(data: Omit<AvailabilityEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<AvailabilityEntity>;
  update(id: string, data: Partial<Omit<AvailabilityEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<AvailabilityEntity | null>;
  upsertByProviderAndDay(providerId: string, dayOfWeek: number, timeSlots: TimeSlot[]): Promise<AvailabilityEntity>;
}

// Booking Repository
export interface IBookingRepository {
  findById(id: string): Promise<BookingEntity | null>;
  findByUserId(userId: string, status?: BookingStatus): Promise<BookingEntity[]>;
  findByProviderId(providerId: string, status?: BookingStatus): Promise<BookingEntity[]>;
  findAvailableAndAssignedBookings(providerId: string, status?: BookingStatus): Promise<BookingEntity[]>;
  findByProviderDateAndTime(providerId: string, date: string, timeSlot: string): Promise<BookingEntity | null>;
  create(data: Omit<BookingEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<BookingEntity>;
  update(id: string, data: Partial<Omit<BookingEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<BookingEntity | null>;
}
