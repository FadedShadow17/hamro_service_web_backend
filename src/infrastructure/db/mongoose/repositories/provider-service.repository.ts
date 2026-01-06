import { ProviderService, IProviderService } from '../models/provider-service.model';
import { IProviderServiceRepository } from '../../../application/ports/repositories.port';
import { ProviderServiceEntity } from '../../../domain/entities/provider-service.entity';

export class ProviderServiceRepository implements IProviderServiceRepository {
  async findByProviderId(providerId: string, active?: boolean): Promise<ProviderServiceEntity[]> {
    const query: any = { providerId };
    if (active !== undefined) {
      query.active = active;
    }
    const providerServices = await ProviderService.find(query).populate('serviceId');
    return providerServices.map(this.mapToEntity);
  }

  async findByServiceId(serviceId: string, active?: boolean): Promise<ProviderServiceEntity[]> {
    const query: any = { serviceId };
    if (active !== undefined) {
      query.active = active;
    }
    const providerServices = await ProviderService.find(query).populate('providerId');
    return providerServices.map(this.mapToEntity);
  }

  async findByProviderAndService(providerId: string, serviceId: string): Promise<ProviderServiceEntity | null> {
    const providerService = await ProviderService.findOne({ providerId, serviceId }).populate('serviceId');
    return providerService ? this.mapToEntity(providerService) : null;
  }

  async create(data: Omit<ProviderServiceEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProviderServiceEntity> {
    const providerService = new ProviderService(data);
    const saved = await providerService.save();
    await saved.populate('serviceId');
    return this.mapToEntity(saved);
  }

  private mapToEntity(providerService: IProviderService): ProviderServiceEntity {
    return {
      id: providerService._id.toString(),
      providerId: providerService.providerId.toString(),
      serviceId: providerService.serviceId.toString(),
      price: providerService.price,
      active: providerService.active,
      createdAt: providerService.createdAt,
      updatedAt: providerService.updatedAt,
    };
  }
}

