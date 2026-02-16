import { IAvailabilityRepository } from '../../types/repositories.port';
import { AvailabilityRepository } from '../../repositories/availability.repository';
import { AvailabilityEntity, TimeSlot } from '../../types/availability.entity';

export interface UpdateAvailabilityDTO {
  dayOfWeek: number;
  timeSlots: TimeSlot[];
}

export class UpdateAvailabilityUseCase {
  private availabilityRepository: IAvailabilityRepository;

  constructor(availabilityRepository?: IAvailabilityRepository) {
    this.availabilityRepository = availabilityRepository || new AvailabilityRepository();
  }

  async execute(providerId: string, updates: UpdateAvailabilityDTO[]): Promise<AvailabilityEntity[]> {
    const results: AvailabilityEntity[] = [];

    for (const update of updates) {
      const availability = await this.availabilityRepository.upsertByProviderAndDay(
        providerId,
        update.dayOfWeek,
        update.timeSlots
      );
      results.push(availability);
    }

    return results;
  }
}
