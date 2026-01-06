import { IServiceCategoryRepository } from '../../ports/repositories.port';
import { ServiceCategoryRepository } from '../../../infrastructure/db/mongoose/repositories/service-category.repository';
import { ServiceCategoryEntity } from '../../../domain/entities/service-category.entity';

export class ListCategoriesUseCase {
  private categoryRepository: IServiceCategoryRepository;

  constructor(categoryRepository?: IServiceCategoryRepository) {
    this.categoryRepository = categoryRepository || new ServiceCategoryRepository();
  }

  async execute(active?: boolean): Promise<ServiceCategoryEntity[]> {
    return await this.categoryRepository.findAll(active);
  }
}

