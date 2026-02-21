import { Request, Response, NextFunction } from 'express';
import { getFileUrl } from '../services/upload.service';

export class UploadController {
  
  async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ 
          message: 'No image file provided', 
          code: 'NO_FILE' 
        });
        return;
      }

      const imageUrl = getFileUrl(req.file.filename);

      res.status(200).json({
        message: 'Image uploaded successfully',
        url: imageUrl,
        filename: req.file.filename,
      });
    } catch (error) {
      next(error);
    }
  }
}
