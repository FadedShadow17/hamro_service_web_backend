import { Availability, IAvailability } from '../models/availability.model';
import { IAvailabilityRepository } from '../../../application/ports/repositories.port';
import { AvailabilityEntity, TimeSlot } from '../../../domain/entities/availability.entity';

export class AvailabilityRepository implements IAvailabilityRepository {
  async findByProviderId(providerId: string): Promise<AvailabilityEntity[]> {
    const availabilities = await Availability.find({ providerId }).sort({ dayOfWeek: 1 });
    return availabilities.map(this.mapToEntity);
  }

  async findByProviderAndDay(providerId: string, dayOfWeek: number): Promise<AvailabilityEntity | null> {
    const availability = await Availability.findOne({ providerId, dayOfWeek });
    return availability ? this.mapToEntity(availability) : null;
  }

  async create(data: Omit<AvailabilityEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<AvailabilityEntity> {
    const availability = new Availability(data);
    const saved = await availability.save();
    return this.mapToEntity(saved);
  }

  async update(id: string, data: Partial<Omit<AvailabilityEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<AvailabilityEntity | null> {
    const availability = await Availability.findByIdAndUpdate(id, data, { new: true });
    return availability ? this.mapToEntity(availability) : null;
  }

  async upsertByProviderAndDay(providerId: string, dayOfWeek: number, timeSlots: TimeSlot[]): Promise<AvailabilityEntity> {
    const availability = await Availability.findOneAndUpdate(
      { providerId, dayOfWeek },
      { providerId, dayOfWeek, timeSlots },
      { new: true, upsert: true }
    );
    return this.mapToEntity(availability);
  }

  private mapToEntity(availability: IAvailability): AvailabilityEntity {
    return {
      id: availability._id.toString(),
      providerId: availability.providerId.toString(),
      dayOfWeek: availability.dayOfWeek,
      timeSlots: availability.timeSlots.map(ts => ({
        start: ts.start,
        end: ts.end,
      })),
      createdAt: availability.createdAt,
      updatedAt: availability.updatedAt,
    };
  }
}

