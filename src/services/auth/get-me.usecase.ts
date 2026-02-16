import { IUserRepository } from '../../repositories/user.repository';
import { UserRepository } from '../../repositories/user.repository';
import { HttpError } from '../../errors/http-error';
import { UserEntity } from '../../types/user.entity';

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
    const normalizedRole = (user.role as string) === 'service provider' ? 'provider' : user.role;

    // Return user info (matching Flutter app expectations)
    return {
      _id: user._id.toString(),
      id: user._id.toString(),
      name: user.name,
      fullName: user.name, // Alias for Flutter compatibility
      email: user.email,
      phone: user.phone,
      phoneNumber: user.phone, // Alias for Flutter compatibility
      profileImageUrl: user.profileImageUrl,
      role: normalizedRole,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
