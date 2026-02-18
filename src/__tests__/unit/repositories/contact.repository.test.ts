import { ContactRepositoryImpl } from '../../../repositories/contact.repository';
import { Contact } from '../../../models/contact.model';
import { UserModel } from '../../../models/user.model';

describe('Contact Repository Unit Tests', () => {
  const repository = new ContactRepositoryImpl();
  let testUserId: string;
  let testContactId: string;

  beforeAll(async () => {
    // Create test user
    const testUser = await UserModel.create({
      name: 'Contact Repo Test',
      email: 'contactrepo@example.com',
      passwordHash: 'hashed',
      role: 'user',
    });
    testUserId = testUser._id.toString();
  });

  afterAll(async () => {
    await Contact.deleteMany({ userId: testUserId });
    await UserModel.deleteOne({ email: 'contactrepo@example.com' });
  });

  describe('create', () => {
    test('should create contact', async () => {
      const contact = await repository.create({
        userId: testUserId,
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message content',
        category: 'General',
      });

      expect(contact).toBeDefined();
      expect(contact.subject).toBe('Test Subject');
      testContactId = contact._id.toString();
    });
  });

  describe('findByUserId', () => {
    test('should find contacts by user ID', async () => {
      const contacts = await repository.findByUserId(testUserId);
      
      expect(Array.isArray(contacts)).toBe(true);
      expect(contacts.length).toBeGreaterThan(0);
    });
  });

  describe('findApprovedTestimonials', () => {
    test('should find approved testimonials', async () => {
      // Create a testimonial
      await repository.create({
        userId: testUserId,
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Great Service',
        message: 'This is a testimonial',
        category: 'Testimonial',
        rating: 5,
      });

      const testimonials = await repository.findApprovedTestimonials(10);
      
      expect(Array.isArray(testimonials)).toBe(true);
    });
  });
});
