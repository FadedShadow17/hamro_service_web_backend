import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { RegisterDTO, LoginDTO } from '../dtos/auth.dto';
import { env } from '../config/env';

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
      const error: any = new Error('Email already exists');
      error.status = 409;
      throw error;
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
      const error: any = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    // Compare password hash
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      const error: any = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      env.jwtSecret,
      {
        expiresIn: env.jwtExpiresIn,
      }
    );

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

