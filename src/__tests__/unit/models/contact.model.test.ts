import { Contact } from '../../../models/contact.model';
import { UserModel } from '../../../models/user.model';

describe('Contact Model Unit Tests', () => {
  let testUserId: string;

  beforeAll(async () => {
    const testUser = await UserModel.create({
      name: 'Contact Model Test',
      email: 'contactmodel@example.com',
      passwordHash: 'hashed',
      role: 'user',
    });
    testUserId = testUser._id.toString();
  });

  afterAll(async () => {
    await Contact.deleteMany({ userId: testUserId });
    await UserModel.deleteOne({ email: 'contactmodel@example.com' });
  });

  describe('Contact validation', () => {
    test('should create contact with valid data', async () => {
      const contactData = {
        userId: testUserId,
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'This is a test message',
        category: 'General',
      };

      const contact = new Contact(contactData);
      const savedContact = await contact.save();

      expect(savedContact.subject).toBe(contactData.subject);
      expect(savedContact.category).toBe(contactData.category);
      await Contact.findByIdAndDelete(savedContact._id);
    });

    test('should validate category enum', async () => {
      const contactData = {
        userId: testUserId,
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'This is a test message',
        category: 'InvalidCategory',
      };

      const contact = new Contact(contactData);
      await expect(contact.save()).rejects.toThrow();
    });
  });
});
