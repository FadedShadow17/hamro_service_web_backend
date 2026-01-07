import { LoginDTO } from '../../dtos/auth.dto';
import { IUserRepository } from '../../../infrastructure/db/mongoose/repositories/user.repository';
import { UserRepository } from '../../../infrastructure/db/mongoose/repositories/user.repository';
import { comparePassword } from '../../../infrastructure/auth/password';
import { signToken } from '../../../infrastructure/auth/jwt';
import { HttpError } from '../../../shared/errors/http-error';
import { UserEntity } from '../../../domain/entities/user.entity';

export interface LoginResponse {
  token: string;
  user: UserEntity;
}

export class LoginUserUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository?: IUserRepository) {
    this.userRepository = userRepository || new UserRepository();
  }

  async execute(dto: LoginDTO): Promise<LoginResponse> {
    // Find user by email
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new HttpError(401, 'Invalid email or password');
    }

    // Compare password hash
    const isPasswordValid = await comparePassword(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new HttpError(401, 'Invalid email or password');
    }

    // Normalize role: convert 'service provider' to 'provider' for backward compatibility
    const normalizedRole = user.role === 'service provider' ? 'provider' : user.role;

    // Generate JWT token
    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      role: normalizedRole,
    });

    // Return token + user info
    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImageUrl: user.profileImageUrl,
        role: normalizedRole,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }
}

