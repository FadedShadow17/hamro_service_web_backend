import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../dtos/auth.dto';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Parse and validate DTO
      const dto = registerSchema.parse(req.body);

      // Call service
      const user = await this.authService.registerUser(dto);

      // Send HTTP response
      res.status(201).json({
        message: 'User registered successfully',
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Parse and validate DTO
      const dto = loginSchema.parse(req.body);

      // Call service
      const result = await this.authService.loginUser(dto);

      // Send HTTP response
      res.status(200).json({
        message: 'Login successful',
        token: result.token,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Forgot password (placeholder)
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      message: 'Not implemented yet',
    });
  }
}

