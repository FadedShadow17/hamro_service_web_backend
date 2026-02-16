import { LoginDTO } from '../../dtos/auth.dto';
import { IUserRepository } from '../../repositories/user.repository';
import { UserRepository } from '../../repositories/user.repository';
import { comparePassword, signToken } from '../auth.service';
import { HttpError } from '../../errors/http-error';
import { UserEntity } from '../../types/user.entity';

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
