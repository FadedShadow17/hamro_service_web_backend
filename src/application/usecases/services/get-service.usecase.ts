import { IServiceRepository } from '../../ports/repositories.port';
import { ServiceRepository } from '../../../infrastructure/db/mongoose/repositories/service.repository';
import { ServiceEntity } from '../../../domain/entities/service.entity';
import { HttpError } from '../../../shared/errors/http-error';

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

