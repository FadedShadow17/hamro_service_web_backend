import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { upload } from '../services/upload.service';

const router = Router();
const uploadController = new UploadController();

const uploadImage = upload.single('image');

router.post(
  '/image',
  requireAuth,
  uploadImage,
  (req, res, next) => uploadController.uploadImage(req, res, next)
);

export default router;
