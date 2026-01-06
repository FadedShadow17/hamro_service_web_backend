import { Response, NextFunction } from 'express';
import { GetAvailabilityUseCase } from '../../application/usecases/availability/get-availability.usecase';
import { UpdateAvailabilityUseCase } from '../../application/usecases/availability/update-availability.usecase';
import { IProviderProfileRepository } from '../../application/ports/repositories.port';
import { ProviderProfileRepository } from '../../infrastructure/db/mongoose/repositories/provider-profile.repository';
import { AuthRequest } from '../middlewares/auth.middleware';
import { HttpError } from '../../shared/errors/http-error';
import { z } from 'zod';

const updateAvailabilitySchema = z.array(
  z.object({
    dayOfWeek: z.number().min(0).max(6),
    timeSlots: z.array(
      z.object({
        start: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
        end: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
      })
    ),
  })
);

export class AvailabilityController {
  /**
   * Get provider's availability
   * GET /api/provider/availability
   */
  async get(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Get provider profile for this user
      const providerProfileRepo = new ProviderProfileRepository();
      const profile = await providerProfileRepo.findByUserId(req.user.id);
      if (!profile) {
        throw new HttpError(404, 'Provider profile not found');
      }

      const useCase = new GetAvailabilityUseCase();
      const availability = await useCase.execute(profile.id);
      res.status(200).json({ availability });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update provider's availability
   * PUT /api/provider/availability
   */
  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Get provider profile for this user
      const providerProfileRepo = new ProviderProfileRepository();
      const profile = await providerProfileRepo.findByUserId(req.user.id);
      if (!profile) {
        throw new HttpError(404, 'Provider profile not found');
      }

      const dto = updateAvailabilitySchema.parse(req.body);
      const useCase = new UpdateAvailabilityUseCase();
      const availability = await useCase.execute(profile.id, dto);
      res.status(200).json({ message: 'Availability updated successfully', availability });
    } catch (error) {
      next(error);
    }
  }
}

