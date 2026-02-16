import { IServiceRepository } from '../../types/repositories.port';
import { ServiceRepository } from '../../repositories/service.repository';
import { ServiceEntity } from '../../types/service.entity';

export class ListServicesUseCase {
  private serviceRepository: IServiceRepository;

  constructor(serviceRepository?: IServiceRepository) {
    this.serviceRepository = serviceRepository || new ServiceRepository();
  }

  async execute(active?: boolean): Promise<ServiceEntity[]> {
    return await this.serviceRepository.findAll(active);
  }
}
