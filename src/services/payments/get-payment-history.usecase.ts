import { IBookingRepository } from '../../types/repositories.port';
import { BookingRepository } from '../../repositories/booking.repository';
import { BookingEntity } from '../../types/booking.entity';
import { BOOKING_STATUS } from '../../config/constants';

export class GetPaymentHistoryUseCase {
  private bookingRepository: IBookingRepository;

  constructor(bookingRepository?: IBookingRepository) {
    this.bookingRepository = bookingRepository || new BookingRepository();
  }

  async execute(userId: string): Promise<BookingEntity[]> {
    const allBookings = await this.bookingRepository.findByUserId(userId);
    
    const paymentHistory = allBookings.filter(booking => 
      booking.paymentStatus === 'PAID' || booking.status === BOOKING_STATUS.COMPLETED
    );
    
    return paymentHistory.sort((a, b) => {
      const dateA = a.paidAt ? new Date(a.paidAt).getTime() : new Date(a.createdAt).getTime();
      const dateB = b.paidAt ? new Date(b.paidAt).getTime() : new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }
}
