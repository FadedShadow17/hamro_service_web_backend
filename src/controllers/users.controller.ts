import { Response, NextFunction } from 'express';
import { UpdateUserProfileUseCase } from '../services/users/update-user-profile.usecase';
import { updateUserProfileSchema } from '../dtos/user.dto';
import { AuthRequest } from '../middlewares/auth.middleware';
import { getFileUrl } from '../services/upload.service';

export class UsersController {
  
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized', code: 'UNAUTHORIZED' });
        return;
      }

      const body: any = { ...req.body };

      if (req.file) {
        body.profileImageUrl = getFileUrl(req.file.filename);
      }

      const dto = updateUserProfileSchema.parse(body);

      const updateData: any = { ...dto };
      if (body.profileImageUrl) {
        updateData.profileImageUrl = body.profileImageUrl;
      }

      const useCase = new UpdateUserProfileUseCase();
      const updatedUser = await useCase.execute(req.user.id, updateData);

      res.status(200).json({
        message: 'Profile updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  
  async uploadAvatar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized', code: 'UNAUTHORIZED' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ message: 'No file uploaded', code: 'NO_FILE' });
        return;
      }

      const profileImageUrl = getFileUrl(req.file.filename);

      const useCase = new UpdateUserProfileUseCase();
      const updatedUser = await useCase.execute(req.user.id, { profileImageUrl });

      res.status(200).json({
        message: 'Avatar uploaded successfully',
        user: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }
}
