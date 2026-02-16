import { IServiceRepository } from '../../types/repositories.port';
import { ServiceRepository } from '../../repositories/service.repository';
import { ServiceEntity } from '../../types/service.entity';
import { HttpError } from '../../errors/http-error';

export class GetServiceUseCase {
  private serviceRepository: IServiceRepository;

  constructor(serviceRepository?: IServiceRepository) {
    this.serviceRepository = serviceRepository || new ServiceRepository();
  }

  async execute(serviceId: string): Promise<ServiceEntity> {
    const service = await this.serviceRepository.findById(serviceId);
    if (!service) {
      throw new HttpError(404, 'Service not found');
    }
    return service;
  }
}
