import { ProviderProfile, IProviderProfile } from '../models/provider-profile.model';
import { IProviderProfileRepository } from '../../../application/ports/repositories.port';
import { ProviderProfileEntity } from '../../../domain/entities/provider-profile.entity';

export class ProviderProfileRepository implements IProviderProfileRepository {
  async findByUserId(userId: string): Promise<ProviderProfileEntity | null> {
    const profile = await ProviderProfile.findOne({ userId }).populate('userId');
    return profile ? this.mapToEntity(profile) : null;
  }

  async findById(id: string): Promise<ProviderProfileEntity | null> {
    const profile = await ProviderProfile.findById(id).populate('userId');
    return profile ? this.mapToEntity(profile) : null;
  }

  async findByArea(area: string, active?: boolean): Promise<ProviderProfileEntity[]> {
    const query: any = { area };
    if (active !== undefined) {
      query.active = active;
    }
    const profiles = await ProviderProfile.find(query).populate('userId');
    return profiles.map(this.mapToEntity);
  }

  async create(data: Omit<ProviderProfileEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProviderProfileEntity> {
    const profile = new ProviderProfile(data);
    const saved = await profile.save();
    await saved.populate('userId');
    return this.mapToEntity(saved);
  }

  async update(id: string, data: Partial<Omit<ProviderProfileEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ProviderProfileEntity | null> {
    const profile = await ProviderProfile.findByIdAndUpdate(id, data, { new: true }).populate('userId');
    return profile ? this.mapToEntity(profile) : null;
  }

  private mapToEntity(profile: IProviderProfile): ProviderProfileEntity {
    return {
      id: profile._id.toString(),
      userId: profile.userId.toString(),
      city: profile.city,
      area: profile.area,
      phone: profile.phone,
      bio: profile.bio,
      active: profile.active,
      verificationStatus: profile.verificationStatus,
      fullName: profile.fullName,
      phoneNumber: profile.phoneNumber,
      citizenshipNumber: profile.citizenshipNumber,
      citizenshipFrontImage: profile.citizenshipFrontImage,
      citizenshipBackImage: profile.citizenshipBackImage,
      profileImage: profile.profileImage,
      selfieImage: profile.selfieImage,
      address: profile.address,
      verifiedAt: profile.verifiedAt,
      rejectionReason: profile.rejectionReason,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}

