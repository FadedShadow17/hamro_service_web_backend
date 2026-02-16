import { RegisterDTO } from '../../dtos/auth.dto';
import { IUserRepository } from '../../repositories/user.repository';
import { UserRepository } from '../../repositories/user.repository';
import { hashPassword, signToken } from '../auth.service';
import { HttpError } from '../../errors/http-error';
import { UserEntity } from '../../types/user.entity';
import { USER_ROLES } from '../../config/constants';

export interface RegisterResponse {
  token: string;
  user: UserEntity;
}

export class RegisterUserUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository?: IUserRepository) {
    this.userRepository = userRepository || new UserRepository();
  }

  async execute(dto: RegisterDTO): Promise<RegisterResponse> {
    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new HttpError(409, 'Email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(dto.password);

    // Default role to USER if not provided
    const role = dto.role || USER_ROLES.USER;

    // Create user via repository
    const user = await this.userRepository.createUser({
      name: dto.name,
      email: dto.email,
      passwordHash,
      phone: dto.phone, // phoneNumber is already transformed to phone in DTO
      role: role,
    });

    // Normalize role: convert 'service provider' to 'provider' for backward compatibility
    const normalizedRole = (user.role as string) === 'service provider' ? 'provider' : user.role;

    // Generate JWT token
    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      role: normalizedRole,
    });

    // Return token + user info (matching Flutter app expectations)
    return {
      token,
      user: {
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
      },
    };
  }
}
