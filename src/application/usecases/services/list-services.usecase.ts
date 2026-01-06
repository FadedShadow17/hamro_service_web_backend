import { IServiceRepository } from '../../ports/repositories.port';
import { ServiceRepository } from '../../../infrastructure/db/mongoose/repositories/service.repository';
import { ServiceEntity } from '../../../domain/entities/service.entity';

export class ListServicesUseCase {
  private serviceRepository: IServiceRepository;

  constructor(serviceRepository?: IServiceRepository) {
    this.serviceRepository = serviceRepository || new ServiceRepository();
  }

  async execute(active?: boolean): Promise<ServiceEntity[]> {
    return await this.serviceRepository.findAll(active);
  }
}

