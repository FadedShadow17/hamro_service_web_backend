import { registerSchema, loginSchema } from '../../../dtos/auth.dto';
import { createContactSchema } from '../../../dtos/contact.dto';

describe('Validation Unit Tests', () => {
  describe('registerSchema', () => {
    test('should validate valid registration data', () => {
      const validData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
      };

      const result = registerSchema.parse(validData);
      
      expect(result.name).toBe(validData.name);
      expect(result.email).toBe(validData.email);
    });

    test('should reject invalid email', () => {
      const invalidData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'Password123',
      };

      expect(() => {
        registerSchema.parse(invalidData);
      }).toThrow();
    });
  });

  describe('loginSchema', () => {
    test('should validate valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const result = loginSchema.parse(validData);
      
      expect(result.email).toBe(validData.email);
      expect(result.password).toBe(validData.password);
    });

    test('should reject missing password', () => {
      const invalidData = {
        email: 'test@example.com',
      };

      expect(() => {
        loginSchema.parse(invalidData);
      }).toThrow();
    });
  });

  describe('createContactSchema', () => {
    test('should validate valid contact data', () => {
      const validData = {
        subject: 'Test Subject',
        message: 'This is a test message with enough characters',
        category: 'General',
      };

      const result = createContactSchema.parse(validData);
      
      expect(result.subject).toBe(validData.subject);
      expect(result.category).toBe(validData.category);
    });

    test('should reject invalid category', () => {
      const invalidData = {
        subject: 'Test Subject',
        message: 'This is a test message',
        category: 'InvalidCategory',
      };

      expect(() => {
        createContactSchema.parse(invalidData);
      }).toThrow();
    });
  });
});
