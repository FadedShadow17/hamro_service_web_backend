import { IAvailabilityRepository } from '../../types/repositories.port';
import { AvailabilityRepository } from '../../repositories/availability.repository';
import { AvailabilityEntity } from '../../types/availability.entity';

export class GetAvailabilityUseCase {
  private availabilityRepository: IAvailabilityRepository;

  constructor(availabilityRepository?: IAvailabilityRepository) {
    this.availabilityRepository = availabilityRepository || new AvailabilityRepository();
  }

  async execute(providerId: string): Promise<AvailabilityEntity[]> {
    return await this.availabilityRepository.findByProviderId(providerId);
  }
}
