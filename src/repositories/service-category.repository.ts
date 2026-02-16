import { ServiceCategory, IServiceCategory } from '../models/service-category.model';
import { IServiceCategoryRepository } from '../types/repositories.port';
import { ServiceCategoryEntity } from '../types/service-category.entity';

export class ServiceCategoryRepository implements IServiceCategoryRepository {
  async findAll(active?: boolean): Promise<ServiceCategoryEntity[]> {
    const query = active !== undefined ? { active } : {};
    const categories = await ServiceCategory.find(query).sort({ name: 1 });
    return categories.map(this.mapToEntity);
  }

  async findById(id: string): Promise<ServiceCategoryEntity | null> {
    const category = await ServiceCategory.findById(id);
    return category ? this.mapToEntity(category) : null;
  }

  async create(data: Omit<ServiceCategoryEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceCategoryEntity> {
    const category = new ServiceCategory(data);
    const saved = await category.save();
    return this.mapToEntity(saved);
  }

  private mapToEntity(category: IServiceCategory): ServiceCategoryEntity {
    return {
      id: category._id.toString(),
      name: category.name,
      description: category.description,
      icon: category.icon,
      active: category.active,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
