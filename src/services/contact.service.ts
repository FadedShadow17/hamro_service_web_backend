import { ContactRepository, ContactRepositoryImpl } from '../repositories/contact.repository';
import { CreateContactDTO } from '../dtos/contact.dto';
import { UserRepository } from '../infrastructure/db/mongoose/repositories/user.repository';
import { HttpError } from '../shared/errors/http-error';
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
  adminReply?: string;
  createdAt: Date;
  updatedAt: Date;
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
      adminReply: contact.adminReply,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    };
  }
}
