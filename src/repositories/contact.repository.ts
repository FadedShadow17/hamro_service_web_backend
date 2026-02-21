import { IContact, Contact } from '../models/contact.model';
import { Types } from 'mongoose';

export interface ContactRepository {
  create(data: {
    userId: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    category: 'General' | 'Booking' | 'Payments' | 'Technical' | 'Other' | 'Testimonial';
    rating?: number;
  }): Promise<IContact>;
  
  findByUserId(userId: string): Promise<IContact[]>;
  
  findById(id: string): Promise<IContact | null>;
  
  findAll(): Promise<IContact[]>;
  
  findApprovedTestimonials(limit?: number): Promise<IContact[]>;
  
  updateStatus(id: string, status: 'open' | 'in-progress' | 'resolved' | 'closed', adminReply?: string): Promise<IContact | null>;
}

export class ContactRepositoryImpl implements ContactRepository {
  async create(data: {
    userId: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    category: 'General' | 'Booking' | 'Payments' | 'Technical' | 'Other' | 'Testimonial';
    rating?: number;
  }): Promise<IContact> {
    const contact = new Contact({
      userId: new Types.ObjectId(data.userId),
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      category: data.category,
      rating: data.rating,

      approved: data.category === 'Testimonial' ? true : undefined,
    });
    
    return await contact.save();
  }

  async findByUserId(userId: string): Promise<IContact[]> {
    return await Contact.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<IContact | null> {
    return await Contact.findById(id).exec();
  }

  async findAll(): Promise<IContact[]> {
    return await Contact.find().sort({ createdAt: -1 }).exec();
  }

  async findApprovedTestimonials(limit: number = 10): Promise<IContact[]> {
    return await Contact.find({
      category: 'Testimonial',
      approved: true,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name email role')
      .exec();
  }
  
  async updateStatus(
    id: string,
    status: 'open' | 'in-progress' | 'resolved' | 'closed',
    adminReply?: string
  ): Promise<IContact | null> {
    const updateData: any = { status };
    if (adminReply) {
      updateData.adminReply = adminReply;
    }
    
    return await Contact.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }
}

