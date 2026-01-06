import { IAvailabilityRepository } from '../../ports/repositories.port';
import { AvailabilityRepository } from '../../../infrastructure/db/mongoose/repositories/availability.repository';
import { AvailabilityEntity } from '../../../domain/entities/availability.entity';

export class GetAvailabilityUseCase {
  private availabilityRepository: IAvailabilityRepository;

  constructor(availabilityRepository?: IAvailabilityRepository) {
    this.availabilityRepository = availabilityRepository || new AvailabilityRepository();
  }

  async execute(providerId: string): Promise<AvailabilityEntity[]> {
    return await this.availabilityRepository.findByProviderId(providerId);
  }
}

