import { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from '../dtos/auth.dto';
import { RegisterUserUseCase } from '../services/auth/register-user.usecase';
import { LoginUserUseCase } from '../services/auth/login-user.usecase';
import { GetMeUseCase } from '../services/auth/get-me.usecase';
import { AuthRequest } from '../middlewares/auth.middleware';

export class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Parse and validate DTO
      const dto = registerSchema.parse(req.body);

      // Execute use case
      const useCase = new RegisterUserUseCase();
      const result = await useCase.execute(dto);

      // Send HTTP response with token (matching login format)
      res.status(201).json({
        message: 'User registered successfully',
        token: result.token,
        user: result.user,
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

      // Execute use case
      const useCase = new LoginUserUseCase();
      const result = await useCase.execute(dto);

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
   * Get current user
   * GET /api/auth/me
   */
  async getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Execute use case
      const useCase = new GetMeUseCase();
      const user = await useCase.execute(req.user.id);

      // Send HTTP response
      res.status(200).json({
        user,
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
