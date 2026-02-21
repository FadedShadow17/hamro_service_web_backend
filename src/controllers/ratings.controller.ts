import { Request, Response, NextFunction } from 'express';
import { RatingsService } from '../services/ratings.service';
import { createRatingSchema } from '../dtos/rating.dto';
import { AuthRequest } from '../middlewares/auth.middleware';

export class RatingsController {
  private ratingsService: RatingsService;

  constructor() {
    this.ratingsService = new RatingsService();
  }

  
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized', code: 'UNAUTHORIZED' });
        return;
      }

      const dto = createRatingSchema.parse(req.body);

      const rating = await this.ratingsService.createRating(req.user.id, dto);

      res.status(201).json({
        message: 'Rating submitted successfully',
        rating,
      });
    } catch (error) {
      next(error);
    }
  }

  
  async getProviderRatings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const ratings = await this.ratingsService.getProviderRatings(id);

      res.status(200).json({
        message: 'Ratings retrieved successfully',
        ratings,
      });
    } catch (error) {
      next(error);
    }
  }

  
  async getUserRatings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const ratings = await this.ratingsService.getUserRatings(id);

      res.status(200).json({
        message: 'Ratings retrieved successfully',
        ratings,
      });
    } catch (error) {
      next(error);
    }
  }

  
  async getRatingForBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const rating = await this.ratingsService.getRatingForBooking(id);

      if (!rating) {
        res.status(404).json({
          message: 'Rating not found for this booking',
          rating: null,
        });
        return;
      }

      res.status(200).json({
        message: 'Rating retrieved successfully',
        rating,
      });
    } catch (error) {
      next(error);
    }
  }
}
