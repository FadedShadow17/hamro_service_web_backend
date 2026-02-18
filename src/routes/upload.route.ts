import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { upload } from '../services/upload.service';

const router = Router();
const uploadController = new UploadController();

// Configure multer for single image upload
const uploadImage = upload.single('image');

// POST /api/upload/image - Upload a single image
router.post(
  '/image',
  requireAuth,
  uploadImage,
  (req, res, next) => uploadController.uploadImage(req, res, next)
);

export default router;
