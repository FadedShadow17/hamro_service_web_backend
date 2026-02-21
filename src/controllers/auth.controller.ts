import { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from '../dtos/auth.dto';
import { RegisterUserUseCase } from '../services/auth/register-user.usecase';
import { LoginUserUseCase } from '../services/auth/login-user.usecase';
import { GetMeUseCase } from '../services/auth/get-me.usecase';
import { AuthRequest } from '../middlewares/auth.middleware';

export class AuthController {
  
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {

      const dto = registerSchema.parse(req.body);

      const useCase = new RegisterUserUseCase();
      const result = await useCase.execute(dto);

      res.status(201).json({
        message: 'User registered successfully',
        token: result.token,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  }

  
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {

      const dto = loginSchema.parse(req.body);

      const useCase = new LoginUserUseCase();
      const result = await useCase.execute(dto);

      res.status(200).json({
        message: 'Login successful',
        token: result.token,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  }

  
  async getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const useCase = new GetMeUseCase();
      const user = await useCase.execute(req.user.id);

      res.status(200).json({
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  
  async forgotPassword(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      message: 'Not implemented yet',
    });
  }
}
