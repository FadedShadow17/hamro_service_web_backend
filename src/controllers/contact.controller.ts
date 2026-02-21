import { Request, Response, NextFunction } from 'express';
import { ContactService } from '../services/contact.service';
import { createContactSchema } from '../dtos/contact.dto';
import { AuthRequest } from '../middlewares/auth.middleware';

export class ContactController {
  private contactService: ContactService;

  constructor() {
    this.contactService = new ContactService();
  }

  
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new Error('User not authenticated'));
      }

      const dto = createContactSchema.parse(req.body);

      const contact = await this.contactService.createContact(req.user.id, dto);

      res.status(201).json({
        message: 'Contact message submitted successfully',
        contact,
      });
    } catch (error) {
      next(error);
    }
  }

  
  async getMyContacts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new Error('User not authenticated'));
      }

      const contacts = await this.contactService.getMyContacts(req.user.id);

      res.status(200).json({
        message: 'Contact messages retrieved successfully',
        contacts,
      });
    } catch (error) {
      next(error);
    }
  }

  
  async getAllContacts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new Error('User not authenticated'));
      }




      const contacts = await this.contactService.getAllContacts();

      res.status(200).json({
        message: 'All contact messages retrieved successfully',
        contacts,
      });
    } catch (error) {
      next(error);
    }
  }

  
  async getTestimonials(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const testimonials = await this.contactService.getApprovedTestimonials(limit);

      res.status(200).json({
        message: 'Testimonials retrieved successfully',
        testimonials,
      });
    } catch (error) {
      next(error);
    }
  }
}
