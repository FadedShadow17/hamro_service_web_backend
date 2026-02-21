import { IBookingRepository, IProviderProfileRepository, IServiceRepository } from '../../types/repositories.port';
import { BookingRepository } from '../../repositories/booking.repository';
import { ProviderProfileRepository } from '../../repositories/provider-profile.repository';
import { ServiceRepository } from '../../repositories/service.repository';
import { BookingEntity } from '../../types/booking.entity';
import { isCategoryMatch } from '../category-matcher.service';

export interface DashboardSummary {
  pending: number;
  confirmed: number;
  completed: number;
  total: number;
  upcoming: BookingEntity[];
  recent: BookingEntity[];
}

export class GetProviderDashboardSummaryUseCase {
  private bookingRepository: IBookingRepository;
  private providerProfileRepository: IProviderProfileRepository;
  private serviceRepository: IServiceRepository;

  constructor(
    bookingRepository?: IBookingRepository,
    providerProfileRepository?: IProviderProfileRepository,
    serviceRepository?: IServiceRepository
  ) {
    this.bookingRepository = bookingRepository || new BookingRepository();
    this.providerProfileRepository = providerProfileRepository || new ProviderProfileRepository();
    this.serviceRepository = serviceRepository || new ServiceRepository();
  }

  
  async execute(providerId: string): Promise<DashboardSummary> {

    const providerProfile = await this.providerProfileRepository.findById(providerId);
    if (!providerProfile) {
      throw new Error('Provider profile not found');
    }

    const allBookings = await this.bookingRepository.findAvailableAndAssignedBookings(providerId);

    const visibleBookings: BookingEntity[] = [];
    
    for (const booking of allBookings) {

      if (booking.providerId && booking.providerId === providerId) {
        visibleBookings.push(booking);
      } 

      else if (!booking.providerId && booking.service) {



        if (providerProfile.serviceRole) {
          const categoryMatches = isCategoryMatch(providerProfile.serviceRole, booking.service.name);
          if (categoryMatches) {
            visibleBookings.push(booking);
          }
        } else {

          visibleBookings.push(booking);
        }
      } else if (!booking.providerId && !booking.service) {

        visibleBookings.push(booking);
      }
    }

    const pending = visibleBookings.filter(b => b.status === 'PENDING').length;
    const confirmed = visibleBookings.filter(b => b.status === 'CONFIRMED').length;
    const completed = visibleBookings.filter(b => b.status === 'COMPLETED').length;

    const total = visibleBookings.filter(b => 
      b.status !== 'DECLINED' && b.status !== 'CANCELLED'
    ).length;



    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingBookings = visibleBookings
      .filter(b => {

        if (b.status !== 'CONFIRMED' && b.status !== 'PENDING') return false;

        try {
          const bookingDate = new Date(`${b.date}T${b.timeSlot}`);
          return bookingDate >= today;
        } catch {
          return false;
        }
      })
      .sort((a, b) => {

        try {
          const dateA = new Date(`${a.date}T${a.timeSlot}`);
          const dateB = new Date(`${b.date}T${b.timeSlot}`);

          if (a.status === 'CONFIRMED' && b.status !== 'CONFIRMED') return -1;
          if (b.status === 'CONFIRMED' && a.status !== 'CONFIRMED') return 1;
          
          return dateA.getTime() - dateB.getTime();
        } catch {
          return 0;
        }
      })
      .slice(0, 5);

    const recentBookings = visibleBookings
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt);
        const dateB = new Date(b.updatedAt || b.createdAt);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);

    return {
      pending,
      confirmed,
      completed,
      total,
      upcoming: upcomingBookings,
      recent: recentBookings,
    };
  }
}
