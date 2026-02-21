import { Service, IService } from '../models/service.model';
import { IServiceRepository } from '../types/repositories.port';
import { ServiceEntity } from '../types/service.entity';

export class ServiceRepository implements IServiceRepository {
  async findAll(active?: boolean): Promise<ServiceEntity[]> {
    const query = active !== undefined ? { isActive: active } : {};
    const services = await Service.find(query).sort({ name: 1 });
    return services.map(this.mapToEntity);
  }

  async findById(id: string): Promise<ServiceEntity | null> {
    const service = await Service.findById(id);
    return service ? this.mapToEntity(service) : null;
  }

  async findBySlug(slug: string): Promise<ServiceEntity | null> {
    const service = await Service.findOne({ slug });
    return service ? this.mapToEntity(service) : null;
  }

  async findByCategoryId(categoryId: string, active?: boolean): Promise<ServiceEntity[]> {

    return [];
  }

  async create(data: Omit<ServiceEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceEntity> {
    const service = new Service(data);
    const saved = await service.save();
    return this.mapToEntity(saved);
  }

  private mapToEntity(service: IService): ServiceEntity {
    return {
      id: service._id.toString(),
      name: service.name,
      slug: service.slug,
      description: service.description,
      icon: service.icon,
      basePrice: service.basePrice,
      isActive: service.isActive,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }
}
