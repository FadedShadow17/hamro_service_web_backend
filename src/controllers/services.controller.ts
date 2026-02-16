import { Request, Response, NextFunction } from 'express';
import { ListServicesUseCase } from '../services/services/list-services.usecase';
import { GetServiceUseCase } from '../services/services/get-service.usecase';
import { GetAvailableProvidersUseCase } from '../services/services/get-available-providers.usecase';
import { ListCategoriesUseCase } from '../services/services/list-categories.usecase';

export class ServicesController {
  /**
   * List all services
   * GET /api/services
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = new ListServicesUseCase();
      // Always return only active services for this endpoint
      const services = await useCase.execute(true);
      res.status(200).json({ 
        success: true,
        data: services 
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get service by ID
   * GET /api/services/:id
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const useCase = new GetServiceUseCase();
      const service = await useCase.execute(id);
      res.status(200).json({ service });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get available providers for a service
   * GET /api/services/:id/providers?date=YYYY-MM-DD&area=AREA
   */
  async getAvailableProviders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { date, area } = req.query;

      if (!date || typeof date !== 'string') {
        res.status(400).json({ message: 'Date query parameter is required (YYYY-MM-DD)' });
        return;
      }

      if (!area || typeof area !== 'string') {
        res.status(400).json({ message: 'Area query parameter is required' });
        return;
      }

      const useCase = new GetAvailableProvidersUseCase();
      const providers = await useCase.execute(id, date, area);
      res.status(200).json({ providers });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all service categories
   * GET /api/service-categories
   */
  async listCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const active = req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined;
      const useCase = new ListCategoriesUseCase();
      const categories = await useCase.execute(active);
      res.status(200).json({ categories });
    } catch (error) {
      next(error);
    }
  }
}
