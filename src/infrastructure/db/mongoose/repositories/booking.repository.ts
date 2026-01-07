import { Booking, IBooking } from '../models/booking.model';
import { IBookingRepository } from '../../../application/ports/repositories.port';
import { BookingEntity } from '../../../domain/entities/booking.entity';
import { BookingStatus } from '../../../../shared/constants';

export class BookingRepository implements IBookingRepository {
  async findById(id: string): Promise<BookingEntity | null> {
    try {
      const booking = await Booking.findById(id)
        .populate('userId')
        .populate('serviceId');
      
      if (!booking) {
        return null;
      }

      // Conditionally populate providerId if it exists
      if (booking.providerId) {
        try {
          await booking.populate('providerId');
        } catch (populateError) {
          // Log but don't fail - providerId might reference a non-existent document
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
    // Populate providerId only for bookings that have it
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

  /**
   * Find available bookings (unassigned) and bookings assigned to a specific provider
   * Returns:
   * - All PENDING bookings with providerId = null (available to claim)
   * - All bookings where providerId = providerId (already claimed by this provider)
   * 
   * Note: Category filtering for unassigned bookings is done in the use case layer
   * to allow for proper category matching logic
   */
  async findAvailableAndAssignedBookings(providerId: string, status?: BookingStatus): Promise<BookingEntity[]> {
    // Query: (status = PENDING AND providerId = null) OR (providerId = providerId)
    // This shows:
    // - Unassigned PENDING bookings (available to claim)
    // - All bookings assigned to this provider (any status)
    const query: any = {
      $or: [
        { status: 'PENDING', providerId: null },
        { providerId: providerId },
      ],
    };
    
    // If status filter is provided, apply it
    if (status) {
      // For status filter:
      // - If PENDING: show unassigned PENDING OR assigned PENDING to this provider
      // - For other statuses: only show bookings assigned to this provider with that status
      if (status === 'PENDING') {
        query.$or = [
          { status: 'PENDING', providerId: null },
          { providerId: providerId, status: 'PENDING' },
        ];
      } else {
        // For CONFIRMED, COMPLETED, DECLINED, CANCELLED: only show if assigned to this provider
        query.$or = [
          { providerId: providerId, status },
        ];
      }
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
    // Re-populate to ensure all fields are fresh
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

    // Extract user details if populated (for provider dashboard)
    const user = (booking.userId as any)?.name
      ? {
          id: (booking.userId as any)._id.toString(),
          name: (booking.userId as any).name,
          email: (booking.userId as any).email,
          phone: (booking.userId as any).phone || undefined, // Phone from User model
        }
      : undefined;

    // Extract provider details if populated (for user dashboard)
    const provider = (booking.providerId as any)?.fullName || (booking.providerId as any)?._id
      ? {
          id: (booking.providerId as any)._id.toString(),
          fullName: (booking.providerId as any).fullName || undefined,
          serviceRole: (booking.providerId as any).serviceRole || undefined,
          phone: (booking.providerId as any).phoneNumber || (booking.providerId as any).phone || undefined,
        }
      : undefined;

    // Extract providerId correctly - handle both ObjectId and populated object
    let providerId: string | null = null;
    if (booking.providerId) {
      // If populated as object, use _id; otherwise use toString() directly
      if (typeof booking.providerId === 'object' && (booking.providerId as any)._id) {
        providerId = (booking.providerId as any)._id.toString();
      } else {
        providerId = booking.providerId.toString();
      }
    }

    return {
      id: booking._id.toString(),
      userId: booking.userId.toString(),
      providerId: providerId,
      serviceId: serviceId,
      service: service,
      user: user, // Include user info for provider dashboard
      provider: provider, // Include provider info for user dashboard
      date: booking.date,
      timeSlot: booking.timeSlot,
      area: booking.area,
      status: booking.status,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }
}

