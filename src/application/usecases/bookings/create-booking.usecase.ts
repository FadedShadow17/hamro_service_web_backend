import { CreateBookingDTO } from '../../dtos/booking.dto';
import { IBookingRepository } from '../../ports/repositories.port';
import { IProviderProfileRepository } from '../../ports/repositories.port';
import { IProviderServiceRepository } from '../../ports/repositories.port';
import { IServiceRepository } from '../../ports/repositories.port';
import { BookingRepository } from '../../../infrastructure/db/mongoose/repositories/booking.repository';
import { ProviderProfileRepository } from '../../../infrastructure/db/mongoose/repositories/provider-profile.repository';
import { ProviderServiceRepository } from '../../../infrastructure/db/mongoose/repositories/provider-service.repository';
import { ServiceRepository } from '../../../infrastructure/db/mongoose/repositories/service.repository';
import { BookingEntity } from '../../../domain/entities/booking.entity';
import { BOOKING_STATUS, VERIFICATION_STATUS } from '../../../shared/constants';
import { HttpError } from '../../../shared/errors/http-error';

export class CreateBookingUseCase {
  private bookingRepository: IBookingRepository;
  private providerProfileRepository: IProviderProfileRepository;
  private providerServiceRepository: IProviderServiceRepository;
  private serviceRepository: IServiceRepository;

  constructor(
    bookingRepository?: IBookingRepository,
    providerProfileRepository?: IProviderProfileRepository,
    providerServiceRepository?: IProviderServiceRepository,
    serviceRepository?: IServiceRepository
  ) {
    this.bookingRepository = bookingRepository || new BookingRepository();
    this.providerProfileRepository = providerProfileRepository || new ProviderProfileRepository();
    this.providerServiceRepository = providerServiceRepository || new ProviderServiceRepository();
    this.serviceRepository = serviceRepository || new ServiceRepository();
  }

  async execute(userId: string, dto: CreateBookingDTO): Promise<BookingEntity> {
    // Validate service exists
    const service = await this.serviceRepository.findById(dto.serviceId);
    if (!service) {
      throw new HttpError(404, 'Service not found', undefined, 'SERVICE_NOT_FOUND');
    }
    if (!service.isActive) {
      throw new HttpError(400, 'Service is not active', undefined, 'SERVICE_INACTIVE');
    }

    let providerId = dto.providerId;
    let providerSource = 'explicit'; // Track how provider was determined

    // If no provider is specified, find provider for the service (IGNORE LOCATION)
    if (!providerId) {
      // Priority 1: Find providers offering this service via ProviderService (ignore location)
      const providerServices = await this.providerServiceRepository.findByServiceId(dto.serviceId, true);
      
      if (providerServices.length > 0) {
        // Get all provider profiles for these services and filter for verified ones
        const providerProfiles = await Promise.all(
          providerServices.map(ps => this.providerProfileRepository.findById(ps.providerId))
        );
        
        // Find first active and verified provider
        const verifiedProvider = providerProfiles.find(
          p => p && p.active && p.verificationStatus === 'APPROVED'
        );
        
        if (verifiedProvider) {
          providerId = verifiedProvider.id;
          providerSource = 'service_provider_verified';
          console.info('[Booking] Verified provider found via service (location ignored):', {
            serviceId: dto.serviceId,
            providerId,
            providerName: verifiedProvider.fullName || verifiedProvider.serviceRole,
            providerCount: providerServices.length,
            requestedLocation: dto.area,
          });
        } else {
          // If no verified provider, use first active provider
          const activeProvider = providerProfiles.find(p => p && p.active);
          if (activeProvider) {
            providerId = activeProvider.id;
            providerSource = 'service_provider';
            console.info('[Booking] Provider found via service (not verified, location ignored):', {
              serviceId: dto.serviceId,
              providerId,
              providerCount: providerServices.length,
              requestedLocation: dto.area,
            });
          }
        }
      }
      
      // Priority 2: If no provider found via ProviderService, try matching by service role (ignore location)
      if (!providerId) {
        // Get service name to match with provider role
        const serviceName = service.name.toLowerCase();
        
        // Try to match service name with provider roles
        // e.g., "Electrical" service -> "Electrician" role, "Plumbing" -> "Plumber"
        const roleMapping: Record<string, string> = {
          'electrical': 'Electrician',
          'plumbing': 'Plumber',
          'cleaning': 'Cleaner',
          'carpentry': 'Carpenter',
          'painting': 'Painter',
          'hvac': 'HVAC Technician',
          'appliance repair': 'Appliance Repair Technician',
          'gardening': 'Gardener/Landscaper',
          'pest control': 'Pest Control Specialist',
          'water tank cleaning': 'Water Tank Cleaner',
        };
        
        const matchingRole = roleMapping[serviceName] || null;
        
        if (matchingRole) {
          const allProviders = await this.providerProfileRepository.findAll(true);
          const roleMatchedProviders = allProviders.filter(
            p => p.active && p.verificationStatus === 'APPROVED' && p.serviceRole === matchingRole
          );
          
          if (roleMatchedProviders.length > 0) {
            providerId = roleMatchedProviders[0].id;
            providerSource = 'role_match_verified';
            console.info('[Booking] Verified provider found by role match (location ignored):', {
              serviceId: dto.serviceId,
              serviceName,
              matchingRole,
              providerId,
              providerName: roleMatchedProviders[0].fullName || roleMatchedProviders[0].serviceRole,
              requestedLocation: dto.area,
            });
          }
        }
      }
      
      // Priority 3: If still no provider, find any active verified provider (ignore location)
      if (!providerId) {
        const allProviders = await this.providerProfileRepository.findAll(true);
        const verifiedProviders = allProviders.filter(
          p => p.active && p.verificationStatus === 'APPROVED'
        );
        
        if (verifiedProviders.length > 0) {
          providerId = verifiedProviders[0].id;
          providerSource = 'any_verified_provider';
          console.info('[Booking] Any verified provider assigned (location ignored):', {
            serviceId: dto.serviceId,
            providerId,
            providerName: verifiedProviders[0].fullName || verifiedProviders[0].serviceRole,
            requestedLocation: dto.area,
            providerLocation: verifiedProviders[0].area,
          });
        } else if (allProviders.length > 0) {
          // Fallback to any active provider if no verified ones
          providerId = allProviders[0].id;
          providerSource = 'any_active_provider';
          console.info('[Booking] Any active provider assigned (location ignored):', {
            serviceId: dto.serviceId,
            providerId,
            requestedLocation: dto.area,
            providerLocation: allProviders[0].area,
          });
        } else {
          // No providers available - allow booking without provider
          providerId = null;
          providerSource = 'none_available';
          console.warn('[Booking] No providers available - creating booking without provider:', {
            serviceId: dto.serviceId,
            requestedLocation: dto.area,
            availableProviderCount: 0,
            reason: 'No active providers in system - booking will be created without provider assignment',
          });
        }
      }
    }

    // Only validate provider if one was assigned
    if (providerId) {
      const provider = await this.providerProfileRepository.findById(providerId);
      if (!provider) {
        console.error('[Booking] Provider not found:', {
          serviceId: dto.serviceId,
          providerId,
          requestedLocation: dto.area,
        });
        throw new HttpError(404, 'Provider not found', undefined, 'PROVIDER_NOT_FOUND');
      }
      if (!provider.active) {
        console.error('[Booking] Provider inactive:', {
          serviceId: dto.serviceId,
          providerId,
          requestedLocation: dto.area,
        });
        throw new HttpError(400, 'Provider is not active', undefined, 'PROVIDER_INACTIVE');
      }
    }

    // Log final provider assignment
    if (providerSource !== 'explicit' && providerId) {
      const provider = await this.providerProfileRepository.findById(providerId);
      if (provider) {
        console.info('[Booking] Provider assignment complete (location ignored):', {
          serviceId: dto.serviceId,
          providerId,
          providerSource,
          providerName: provider.fullName || provider.serviceRole,
          requestedLocation: dto.area,
          providerLocation: provider.area,
        });
      }
    }

    // Check if booking already exists (unique constraint) - skip if no specific provider was requested
    if (dto.providerId) {
      const existingBooking = await this.bookingRepository.findByProviderDateAndTime(
        providerId,
        dto.date,
        dto.timeSlot
      );

      if (existingBooking && existingBooking.status !== 'CANCELLED' && existingBooking.status !== 'DECLINED') {
        throw new HttpError(409, 'This time slot is already booked');
      }
    }

    // Create booking (providerId can be null if no providers available)
    const booking = await this.bookingRepository.create({
      userId,
      providerId: providerId || undefined, // Use undefined instead of null for cleaner handling
      serviceId: dto.serviceId,
      date: dto.date,
      timeSlot: dto.timeSlot,
      area: dto.area,
      status: BOOKING_STATUS.PENDING,
    });

    // Log final booking creation
    console.info('[Booking] Booking created successfully:', {
      bookingId: booking.id,
      serviceId: dto.serviceId,
      providerId: providerId || 'none',
      providerSource,
      requestedLocation: dto.area,
    });

    return booking;
  }
}

