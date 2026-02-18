import { Response, NextFunction } from 'express';
import { ProfessionRepository } from '../repositories/profession.repository';
import { AuthRequest } from '../middlewares/auth.middleware';

export class ProfessionController {
  /**
   * Get all active professions
   * GET /api/professions
   */
  async getAllProfessions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const professionRepo = new ProfessionRepository();
      const activeOnly = req.query.active !== 'false'; // Default to active only unless explicitly false
      const professions = await professionRepo.findAll(activeOnly);

      res.status(200).json({
        success: true,
        data: professions,
        count: professions.length,
      });
    } catch (error) {
      next(error);
    }
  }
}
