import { Service, IService } from '../models/service.model';
import { IServiceRepository } from '../../../application/ports/repositories.port';
import { ServiceEntity } from '../../../domain/entities/service.entity';

export class ServiceRepository implements IServiceRepository {
  async findAll(active?: boolean): Promise<ServiceEntity[]> {
    const query = active !== undefined ? { active } : {};
    const services = await Service.find(query).populate('categoryId').sort({ name: 1 });
    return services.map(this.mapToEntity);
  }

  async findById(id: string): Promise<ServiceEntity | null> {
    const service = await Service.findById(id).populate('categoryId');
    return service ? this.mapToEntity(service) : null;
  }

  async findByCategoryId(categoryId: string, active?: boolean): Promise<ServiceEntity[]> {
    const query: any = { categoryId };
    if (active !== undefined) {
      query.active = active;
    }
    const services = await Service.find(query).populate('categoryId').sort({ name: 1 });
    return services.map(this.mapToEntity);
  }

  async create(data: Omit<ServiceEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceEntity> {
    const service = new Service(data);
    const saved = await service.save();
    await saved.populate('categoryId');
    return this.mapToEntity(saved);
  }

  private mapToEntity(service: IService): ServiceEntity {
    return {
      id: service._id.toString(),
      categoryId: service.categoryId.toString(),
      name: service.name,
      description: service.description,
      image: service.image,
      active: service.active,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }
}

