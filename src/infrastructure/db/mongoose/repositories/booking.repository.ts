import { Booking, IBooking } from '../models/booking.model';
import { IBookingRepository } from '../../../application/ports/repositories.port';
import { BookingEntity } from '../../../domain/entities/booking.entity';
import { BookingStatus } from '../../../../shared/constants';

export class BookingRepository implements IBookingRepository {
  async findById(id: string): Promise<BookingEntity | null> {
    const booking = await Booking.findById(id)
      .populate('userId')
      .populate('providerId')
      .populate('serviceId');
    return booking ? this.mapToEntity(booking) : null;
  }

  async findByUserId(userId: string, status?: BookingStatus): Promise<BookingEntity[]> {
    const query: any = { userId };
    if (status) {
      query.status = status;
    }
    const bookings = await Booking.find(query)
      .populate('providerId')
      .populate('serviceId')
      .sort({ date: -1, createdAt: -1 });
    return bookings.map(this.mapToEntity);
  }

  async findByProviderId(providerId: string, status?: BookingStatus): Promise<BookingEntity[]> {
    const query: any = { providerId };
    if (status) {
      query.status = status;
    }
    const bookings = await Booking.find(query)
      .populate('userId')
      .populate('serviceId')
      .sort({ date: -1, createdAt: -1 });
    return bookings.map(this.mapToEntity);
  }

  async findByProviderDateAndTime(providerId: string, date: string, timeSlot: string): Promise<BookingEntity | null> {
    const booking = await Booking.findOne({ providerId, date, timeSlot });
    return booking ? this.mapToEntity(booking) : null;
  }

  async create(data: Omit<BookingEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<BookingEntity> {
    const booking = new Booking(data);
    const saved = await booking.save();
    await saved.populate('userId');
    await saved.populate('providerId');
    await saved.populate('serviceId');
    return this.mapToEntity(saved);
  }

  async update(id: string, data: Partial<Omit<BookingEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<BookingEntity | null> {
    const booking = await Booking.findByIdAndUpdate(id, data, { new: true })
      .populate('userId')
      .populate('providerId')
      .populate('serviceId');
    return booking ? this.mapToEntity(booking) : null;
  }

  private mapToEntity(booking: IBooking): BookingEntity {
    // Check if serviceId is populated (has name property)
    const serviceId = (booking.serviceId as any)?._id 
      ? (booking.serviceId as any)._id.toString() 
      : booking.serviceId.toString();
    
    // Extract service details if populated
    const service = (booking.serviceId as any)?.name 
      ? {
          id: (booking.serviceId as any)._id.toString(),
          name: (booking.serviceId as any).name,
          description: (booking.serviceId as any).description,
          basePrice: (booking.serviceId as any).basePrice,
        }
      : undefined;

    return {
      id: booking._id.toString(),
      userId: booking.userId.toString(),
      providerId: booking.providerId.toString(),
      serviceId: serviceId,
      service: service,
      date: booking.date,
      timeSlot: booking.timeSlot,
      area: booking.area,
      status: booking.status,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }
}

