import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { RegisterDTO, LoginDTO } from '../dtos/auth.dto';
import { env } from '../config/env';
import { HttpError } from '../errors/http-error';

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'service provider';
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginResponse {
  token: string;
  user: SafeUser;
}

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Register a new user
   */
  async registerUser(dto: RegisterDTO): Promise<SafeUser> {
    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new HttpError(409, 'Email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, env.bcryptSaltRounds);

    // Create user via repository
    const user = await this.userRepository.createUser({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: dto.role,
    });

    // Return safe user object (without passwordHash)
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Login user
   */
  async loginUser(dto: LoginDTO): Promise<LoginResponse> {
    // Find user by email
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new HttpError(401, 'Invalid email or password');
    }

    // Compare password hash
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new HttpError(401, 'Invalid email or password');
    }

    // Generate JWT token
    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    
    const token = jwt.sign(payload, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn,
    } as SignOptions);

    // Return token + user info
    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }
}

