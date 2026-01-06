import { Response, NextFunction } from 'express';
import { ContactService } from '../../services/contact.service';
import { createContactSchema } from '../../dtos/contact.dto';
import { AuthRequest } from '../middlewares/auth.middleware';

export class ContactController {
  private contactService: ContactService;

  constructor() {
    this.contactService = new ContactService();
  }

  /**
   * Create a new contact message
   * POST /api/v1/contact
   */
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new Error('User not authenticated'));
      }

      // Parse and validate DTO
      const dto = createContactSchema.parse(req.body);

      // Call service
      const contact = await this.contactService.createContact(req.user.id, dto);

      // Send HTTP response
      res.status(201).json({
        message: 'Contact message submitted successfully',
        contact,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get logged-in user's contact messages
   * GET /api/v1/contact/me
   */
  async getMyContacts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new Error('User not authenticated'));
      }

      // Call service
      const contacts = await this.contactService.getMyContacts(req.user.id);

      // Send HTTP response
      res.status(200).json({
        message: 'Contact messages retrieved successfully',
        contacts,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all contact messages (admin only)
   * GET /api/v1/contact
   */
  async getAllContacts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new Error('User not authenticated'));
      }

      // Check if user is admin (you can add role check here)
      // For now, we'll allow all authenticated users to see all contacts
      // In production, add: if (req.user.role !== 'admin') { throw new HttpError(403, 'Forbidden'); }

      // Call service
      const contacts = await this.contactService.getAllContacts();

      // Send HTTP response
      res.status(200).json({
        message: 'All contact messages retrieved successfully',
        contacts,
      });
    } catch (error) {
      next(error);
    }
  }
}

