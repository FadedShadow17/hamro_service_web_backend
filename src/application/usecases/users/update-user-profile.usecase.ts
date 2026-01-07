import { IUserRepository } from '../../../infrastructure/db/mongoose/repositories/user.repository';
import { UserRepository } from '../../../infrastructure/db/mongoose/repositories/user.repository';
import { UpdateUserProfileDTO } from '../../dtos/user.dto';
import { UserEntity } from '../../../domain/entities/user.entity';
import { HttpError } from '../../../shared/errors/http-error';

export class UpdateUserProfileUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository?: IUserRepository) {
    this.userRepository = userRepository || new UserRepository();
  }

  async execute(userId: string, dto: UpdateUserProfileDTO & { profileImageUrl?: string }): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new HttpError(404, 'User not found', undefined, 'USER_NOT_FOUND');
    }

    // Prepare update data
    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.phone !== undefined) {
      // Handle empty string as null/undefined
      updateData.phone = dto.phone === '' ? undefined : dto.phone;
    }
    if (dto.profileImageUrl !== undefined) updateData.profileImageUrl = dto.profileImageUrl;

    // Update user
    const updated = await this.userRepository.updateUser(userId, updateData);
    if (!updated) {
      throw new HttpError(500, 'Failed to update user profile', undefined, 'UPDATE_FAILED');
    }

    // Normalize role: convert 'service provider' to 'provider' for backward compatibility
    const normalizedRole = updated.role === 'service provider' ? 'provider' : updated.role;

    return {
      id: updated._id.toString(),
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      profileImageUrl: updated.profileImageUrl,
      role: normalizedRole,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }
}

