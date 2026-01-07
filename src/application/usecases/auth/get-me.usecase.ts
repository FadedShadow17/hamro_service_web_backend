import { IUserRepository } from '../../../infrastructure/db/mongoose/repositories/user.repository';
import { UserRepository } from '../../../infrastructure/db/mongoose/repositories/user.repository';
import { HttpError } from '../../../shared/errors/http-error';
import { UserEntity } from '../../../domain/entities/user.entity';

export class GetMeUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository?: IUserRepository) {
    this.userRepository = userRepository || new UserRepository();
  }

  async execute(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    // Normalize role: convert 'service provider' to 'provider' for backward compatibility
    const normalizedRole = user.role === 'service provider' ? 'provider' : user.role;

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      profileImageUrl: user.profileImageUrl,
      role: normalizedRole,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

