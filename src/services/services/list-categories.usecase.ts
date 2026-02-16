import { IServiceCategoryRepository } from '../../types/repositories.port';
import { ServiceCategoryRepository } from '../../repositories/service-category.repository';
import { ServiceCategoryEntity } from '../../types/service-category.entity';

export class ListCategoriesUseCase {
  private categoryRepository: IServiceCategoryRepository;

  constructor(categoryRepository?: IServiceCategoryRepository) {
    this.categoryRepository = categoryRepository || new ServiceCategoryRepository();
  }

  async execute(active?: boolean): Promise<ServiceCategoryEntity[]> {
    return await this.categoryRepository.findAll(active);
  }
}
