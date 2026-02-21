import { Response, NextFunction } from 'express';
import { ProfessionRepository } from '../repositories/profession.repository';
import { AuthRequest } from '../middlewares/auth.middleware';

export class ProfessionController {
  
  async getAllProfessions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const professionRepo = new ProfessionRepository();
      const activeOnly = req.query.active !== 'false'; // Default to active only unless explicitly false
      let professions = await professionRepo.findAll(activeOnly);

      // If active filter returns empty, return all professions instead
      if (professions.length === 0 && activeOnly) {
        professions = await professionRepo.findAll(false);
      }

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
