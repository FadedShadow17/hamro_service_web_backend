import { Profession, IProfession } from '../models/profession.model';
import { ProfessionEntity } from '../types/profession.entity';

export class ProfessionRepository {
  async findAll(activeOnly: boolean = true): Promise<ProfessionEntity[]> {
    const query = activeOnly ? { active: true } : {};
    const professions = await Profession.find(query).sort({ name: 1 });
    return professions.map(this.mapToEntity);
  }

  async findById(id: string): Promise<ProfessionEntity | null> {
    const profession = await Profession.findById(id);
    return profession ? this.mapToEntity(profession) : null;
  }

  async findByName(name: string): Promise<ProfessionEntity | null> {
    const profession = await Profession.findOne({ name });
    return profession ? this.mapToEntity(profession) : null;
  }

  async create(data: Omit<ProfessionEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProfessionEntity> {
    const profession = new Profession(data);
    const saved = await profession.save();
    return this.mapToEntity(saved);
  }

  async update(id: string, data: Partial<Omit<ProfessionEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ProfessionEntity | null> {
    const profession = await Profession.findByIdAndUpdate(id, data, { new: true });
    return profession ? this.mapToEntity(profession) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await Profession.findByIdAndDelete(id);
    return !!result;
  }

  private mapToEntity(profession: IProfession): ProfessionEntity {
    return {
      id: profession._id.toString(),
      name: profession.name,
      description: profession.description,
      active: profession.active,
      createdAt: profession.createdAt,
      updatedAt: profession.updatedAt,
    };
  }
}
