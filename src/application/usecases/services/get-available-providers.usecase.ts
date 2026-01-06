import { IProviderServiceRepository } from '../../ports/repositories.port';
import { IProviderProfileRepository } from '../../ports/repositories.port';
import { IAvailabilityRepository } from '../../ports/repositories.port';
import { IBookingRepository } from '../../ports/repositories.port';
import { ProviderServiceRepository } from '../../../infrastructure/db/mongoose/repositories/provider-service.repository';
import { ProviderProfileRepository } from '../../../infrastructure/db/mongoose/repositories/provider-profile.repository';
import { AvailabilityRepository } from '../../../infrastructure/db/mongoose/repositories/availability.repository';
import { BookingRepository } from '../../../infrastructure/db/mongoose/repositories/booking.repository';
import { ProviderProfileEntity } from '../../../domain/entities/provider-profile.entity';
import { ProviderServiceEntity } from '../../../domain/entities/provider-service.entity';

export interface AvailableProvider {
  providerId: string;
  providerName: string;
  area: string;
  phone?: string;
  bio?: string;
  price: number;
}

export class GetAvailableProvidersUseCase {
  private providerServiceRepository: IProviderServiceRepository;
  private providerProfileRepository: IProviderProfileRepository;
  private availabilityRepository: IAvailabilityRepository;
  private bookingRepository: IBookingRepository;

  constructor(
    providerServiceRepository?: IProviderServiceRepository,
    providerProfileRepository?: IProviderProfileRepository,
    availabilityRepository?: IAvailabilityRepository,
    bookingRepository?: IBookingRepository
  ) {
    this.providerServiceRepository = providerServiceRepository || new ProviderServiceRepository();
    this.providerProfileRepository = providerProfileRepository || new ProviderProfileRepository();
    this.availabilityRepository = availabilityRepository || new AvailabilityRepository();
    this.bookingRepository = bookingRepository || new BookingRepository();
  }

  async execute(serviceId: string, date: string, area: string): Promise<AvailableProvider[]> {
    // Get day of week from date
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();

    // Get all providers offering this service in the area
    const providerServices = await this.providerServiceRepository.findByServiceId(serviceId, true);
    const providerIds = providerServices.map(ps => ps.providerId);

    // Get provider profiles in the area
    const profiles = await this.providerProfileRepository.findByArea(area, true);
    const areaProviderIds = profiles.map(p => p.id);
    
    // Filter to providers who offer the service and are in the area
    const relevantProviderIds = providerIds.filter(id => areaProviderIds.includes(id));

    // Get availability for these providers on this day
    const availableProviders: AvailableProvider[] = [];

    for (const providerId of relevantProviderIds) {
      const profile = profiles.find(p => p.id === providerId);
      if (!profile) continue;

      const availability = await this.availabilityRepository.findByProviderAndDay(providerId, dayOfWeek);
      if (!availability || availability.timeSlots.length === 0) continue;

      // Get provider service to get price
      const providerService = providerServices.find(ps => ps.providerId === providerId);
      if (!providerService) continue;

      // Check if provider has any available time slots (not already booked)
      const hasAvailableSlot = await this.checkAvailableTimeSlots(providerId, date, availability.timeSlots);
      if (!hasAvailableSlot) continue;

      // Get user info for provider name
      const fullProfile = await this.providerProfileRepository.findById(providerId);
      if (!fullProfile) continue;

      availableProviders.push({
        providerId: profile.id,
        providerName: 'Provider', // Will be populated from user
        area: profile.area,
        phone: profile.phone,
        bio: profile.bio,
        price: providerService.price,
      });
    }

    return availableProviders;
  }

  private async checkAvailableTimeSlots(
    providerId: string,
    date: string,
    timeSlots: { start: string; end: string }[]
  ): Promise<boolean> {
    // Check if at least one time slot is not booked
    for (const slot of timeSlots) {
      const booking = await this.bookingRepository.findByProviderDateAndTime(
        providerId,
        date,
        slot.start
      );
      if (!booking || booking.status === 'CANCELLED' || booking.status === 'DECLINED') {
        return true; // At least one slot is available
      }
    }
    return false;
  }
}

