import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { upload } from '../services/upload.service';

const router = Router();
const usersController = new UsersController();

// Configure multer for single file upload (avatar)
const uploadAvatar = upload.single('avatar');

// PATCH /api/users/me - Update user profile (with optional avatar)
router.patch(
  '/me',
  requireAuth,
  uploadAvatar, // Accept file upload but it's optional
  (req, res, next) => usersController.updateProfile(req, res, next)
);

// POST /api/users/me/avatar - Upload profile avatar only
router.post(
  '/me/avatar',
  requireAuth,
  uploadAvatar,
  (req, res, next) => usersController.uploadAvatar(req, res, next)
);

export default router;
