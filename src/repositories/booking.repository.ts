import { Booking, IBooking } from '../models/booking.model';
import { IBookingRepository } from '../types/repositories.port';
import { BookingEntity } from '../types/booking.entity';
import { BookingStatus } from '../config/constants';

export class BookingRepository implements IBookingRepository {
  async findById(id: string): Promise<BookingEntity | null> {
    try {
      const booking = await Booking.findById(id)
        .populate('userId')
        .populate('serviceId');
      
      if (!booking) {
        return null;
      }

      if (booking.providerId) {
        try {
          await booking.populate('providerId');
        } catch (populateError) {

          console.warn('[Booking Repository] Failed to populate providerId:', {
            bookingId: id,
            providerId: booking.providerId,
            error: populateError instanceof Error ? populateError.message : String(populateError),
          });
        }
      }
      
      return this.mapToEntity(booking);
    } catch (error) {
      console.error('[Booking Repository] Error in findById:', {
        bookingId: id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  async findByUserId(userId: string, status?: BookingStatus): Promise<BookingEntity[]> {
    const query: any = { userId };
    if (status) {
      query.status = status;
    }
    const bookings = await Booking.find(query)
      .populate('userId')
      .populate('serviceId')
      .sort({ date: -1, createdAt: -1 });

    for (const booking of bookings) {
      if (booking.providerId) {
        await booking.populate('providerId');
      }
    }
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

  
  async findAvailableAndAssignedBookings(providerId: string, status?: BookingStatus): Promise<BookingEntity[]> {
    console.log('[BookingRepository] findAvailableAndAssignedBookings called:', { providerId, status });

    // Query for unassigned bookings (providerId is null, undefined, or doesn't exist)
    // and bookings assigned to this provider
    // Flatten the $or to avoid nested $or which MongoDB doesn't support
    const query: any = {
      $or: [
        { status: 'PENDING', providerId: null },
        { status: 'PENDING', providerId: { $exists: false } },
        { providerId: providerId },
      ],
    };

    if (status) {
      if (status === 'PENDING') {
        query.$or = [
          { status: 'PENDING', providerId: null },
          { status: 'PENDING', providerId: { $exists: false } },
          { providerId: providerId, status: 'PENDING' },
        ];
      } else {
        query.$or = [
          { providerId: providerId, status },
        ];
      }
    }
    
    console.log('[BookingRepository] Query:', JSON.stringify(query, null, 2));
    
    const bookings = await Booking.find(query)
      .populate('userId')
      .populate('serviceId')
      .sort({ date: -1, createdAt: -1 });
    
    console.log('[BookingRepository] Found bookings:', {
      count: bookings.length,
      bookings: bookings.map(b => ({
        id: b._id.toString(),
        serviceId: b.serviceId,
        serviceIdType: typeof b.serviceId,
        serviceIdIsObject: typeof b.serviceId === 'object',
        serviceName: (b.serviceId as any)?.name,
        providerId: b.providerId,
        status: b.status,
      })),
    });
    
    const entities = bookings.map(this.mapToEntity);
    console.log('[BookingRepository] Mapped entities:', {
      count: entities.length,
      entities: entities.map(e => ({
        id: e.id,
        serviceId: e.serviceId,
        hasService: !!e.service,
        serviceName: e.service?.name,
        providerId: e.providerId,
        status: e.status,
      })),
    });
    
    return entities;
  }

  async findByProviderDateAndTime(providerId: string, date: string, timeSlot: string): Promise<BookingEntity | null> {
    const booking = await Booking.findOne({ providerId, date, timeSlot });
    return booking ? this.mapToEntity(booking) : null;
  }

  async create(data: Omit<BookingEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<BookingEntity> {
    const booking = new Booking(data);
    const saved = await booking.save();
    await saved.populate('userId');
    if (saved.providerId) {
      await saved.populate('providerId');
    }
    await saved.populate('serviceId');
    return this.mapToEntity(saved);
  }

  async update(id: string, data: Partial<Omit<BookingEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<BookingEntity | null> {
    const booking = await Booking.findByIdAndUpdate(id, data, { new: true })
      .populate('userId')
      .populate('serviceId');
    if (booking && booking.providerId) {
      await booking.populate('providerId');
    }

    if (booking) {
      await booking.populate('userId');
      await booking.populate('serviceId');
      if (booking.providerId) {
        await booking.populate('providerId');
      }
    }
    return booking ? this.mapToEntity(booking) : null;
  }

  private mapToEntity(booking: IBooking): BookingEntity {

    const serviceId = (booking.serviceId as any)?._id 
      ? (booking.serviceId as any)._id.toString() 
      : booking.serviceId.toString();

    const service = (booking.serviceId as any)?.name 
      ? {
          id: (booking.serviceId as any)._id.toString(),
          name: (booking.serviceId as any).name,
          description: (booking.serviceId as any).description,
          basePrice: (booking.serviceId as any).basePrice,
        }
      : undefined;

    const user = (booking.userId as any)?.name
      ? {
          id: (booking.userId as any)._id.toString(),
          name: (booking.userId as any).name,
          email: (booking.userId as any).email,
          phone: (booking.userId as any).phone || undefined, // Phone from User model
        }
      : undefined;

    const provider = (booking.providerId as any)?.fullName || (booking.providerId as any)?._id
      ? {
          id: (booking.providerId as any)._id.toString(),
          fullName: (booking.providerId as any).fullName || undefined,
          serviceRole: (booking.providerId as any).serviceRole || undefined,
          phone: (booking.providerId as any).phoneNumber || (booking.providerId as any).phone || undefined,
        }
      : undefined;

    let userId: string;
    if (typeof booking.userId === 'object' && (booking.userId as any)._id) {

      userId = (booking.userId as any)._id.toString();
    } else {

      userId = booking.userId.toString();
    }

    let providerId: string | null = null;
    if (booking.providerId) {

      if (typeof booking.providerId === 'object' && (booking.providerId as any)._id) {
        providerId = (booking.providerId as any)._id.toString();
      } else {
        providerId = booking.providerId.toString();
      }
    }

    return {
      id: booking._id.toString(),
      userId: userId,
      providerId: providerId,
      serviceId: serviceId,
      service: service,
      user: user, // Include user info for provider dashboard
      provider: provider, // Include provider info for user dashboard
      date: booking.date,
      timeSlot: booking.timeSlot,
      area: booking.area,
      status: booking.status,
      paymentStatus: booking.paymentStatus || 'UNPAID',
      paidAt: booking.paidAt || undefined,
      paymentMethod: booking.paymentMethod || undefined,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }
}
