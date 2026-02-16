import { ContactRepository, ContactRepositoryImpl } from '../repositories/contact.repository';
import { CreateContactDTO } from '../dtos/contact.dto';
import { UserRepository } from '../repositories/user.repository';
import { HttpError } from '../errors/http-error';
import { IContact } from '../models/contact.model';

export interface ContactResponse {
  id: string;
  userId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  approved?: boolean;
  rating?: number;
  adminReply?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestimonialResponse {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  service?: string;
  createdAt: Date;
}

export class ContactService {
  private contactRepository: ContactRepository;
  private userRepository: UserRepository;

  constructor() {
    this.contactRepository = new ContactRepositoryImpl();
    this.userRepository = new UserRepository();
  }

  /**
   * Create a new contact message
   */
  async createContact(userId: string, dto: CreateContactDTO): Promise<ContactResponse> {
    // Get user info
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    // Create contact message
    const contact = await this.contactRepository.create({
      userId,
      name: user.name,
      email: user.email,
      subject: dto.subject,
      message: dto.message,
      category: dto.category,
      rating: dto.rating,
    });

    return this.mapToResponse(contact);
  }

  /**
   * Get all contact messages for a user
   */
  async getMyContacts(userId: string): Promise<ContactResponse[]> {
    const contacts = await this.contactRepository.findByUserId(userId);
    return contacts.map(this.mapToResponse);
  }

  /**
   * Get all contact messages (admin only)
   */
  async getAllContacts(): Promise<ContactResponse[]> {
    const contacts = await this.contactRepository.findAll();
    return contacts.map(this.mapToResponse);
  }

  /**
   * Get approved testimonials for public display
   */
  async getApprovedTestimonials(limit: number = 10): Promise<TestimonialResponse[]> {
    const contacts = await this.contactRepository.findApprovedTestimonials(limit);
    
    const testimonials: TestimonialResponse[] = [];
    
    for (const contact of contacts) {
      // Get user info to determine role (userId is populated in repository)
      let userRole = 'Customer';
      let user: any = null;
      
      // Check if userId is populated (object) or just ID (string)
      if (contact.userId && typeof contact.userId === 'object' && 'role' in contact.userId) {
        user = contact.userId;
      } else {
        try {
          user = await this.userRepository.findById(contact.userId.toString());
        } catch (err) {
          // If user lookup fails, continue with default
          console.warn('Failed to get user info for testimonial:', err);
        }
      }

      // Set role based on user role or default to Customer
      if (user && user.role) {
        userRole = user.role === 'provider' ? 'Service Provider' : 'Customer';
      }

      // Extract rating from rating field or subject
      let rating = contact.rating || 5;
      if (!contact.rating && contact.subject.includes('Star')) {
        const match = contact.subject.match(/(\d+)\s*Star/i);
        if (match) {
          rating = parseInt(match[1], 10);
        }
      }

      // Try to extract service name from message, otherwise use default
      let service: string | undefined = 'Website Experience';
      const serviceMatches = [
        contact.message.match(/service[:\s]+([^.\n,]+)/i),
        contact.message.match(/used\s+([^.\n,]+?)\s+(?:for|service)/i),
        contact.message.match(/booking\s+([^.\n,]+?)/i),
      ];
      
      for (const match of serviceMatches) {
        if (match && match[1]) {
          service = match[1].trim();
          break;
        }
      }

      testimonials.push({
        id: contact._id.toString(),
        name: contact.name,
        role: userRole,
        content: contact.message,
        rating: rating,
        service: service,
        createdAt: contact.createdAt,
      });
    }
    
    return testimonials;
  }

  /**
   * Map IContact to ContactResponse
   */
  private mapToResponse(contact: IContact): ContactResponse {
    return {
      id: contact._id.toString(),
      userId: contact.userId.toString(),
      name: contact.name,
      email: contact.email,
      subject: contact.subject,
      message: contact.message,
      category: contact.category,
      status: contact.status,
      approved: contact.approved,
      rating: contact.rating,
      adminReply: contact.adminReply,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    };
  }
}
