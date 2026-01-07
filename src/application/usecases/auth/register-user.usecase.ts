import { RegisterDTO } from '../../dtos/auth.dto';
import { IUserRepository } from '../../../infrastructure/db/mongoose/repositories/user.repository';
import { UserRepository } from '../../../infrastructure/db/mongoose/repositories/user.repository';
import { hashPassword } from '../../../infrastructure/auth/password';
import { HttpError } from '../../../shared/errors/http-error';
import { UserEntity } from '../../../domain/entities/user.entity';

export class RegisterUserUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository?: IUserRepository) {
    this.userRepository = userRepository || new UserRepository();
  }

  async execute(dto: RegisterDTO): Promise<UserEntity> {
    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new HttpError(409, 'Email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(dto.password);

    // Create user via repository
    const user = await this.userRepository.createUser({
      name: dto.name,
      email: dto.email,
      passwordHash,
      phone: dto.phone,
      role: dto.role,
    });

    // Return safe user object (without passwordHash)
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      profileImageUrl: user.profileImageUrl,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

