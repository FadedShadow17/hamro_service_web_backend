/// <reference path="../../../jest.d.ts" />
import request from 'supertest';
import app from '../../app';
import { User } from '../../models/user.model';
import { Contact } from '../../models/contact.model';

describe('Contact Integration Tests', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Create test user and get token
    const testUser = {
      name: 'Contact Test User',
      email: 'contacttest@example.com',
      password: 'Test@1234',
      role: 'user',
    };

    await User.deleteOne({ email: testUser.email });
    
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;
  });

  afterAll(async () => {
    await Contact.deleteMany({ userId });
    await User.deleteOne({ email: 'contacttest@example.com' });
  });

  describe('POST /api/v1/contact', () => {
    test('should create contact message', async () => {
      const response = await request(app)
        .post('/api/v1/contact')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          subject: 'Test Subject',
          message: 'This is a test message',
          category: 'General',
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('contact');
    });

    test('should not create contact without auth', async () => {
      const response = await request(app)
        .post('/api/v1/contact')
        .send({
          subject: 'Test Subject',
          message: 'This is a test message',
          category: 'General',
        });
      
      expect(response.status).toBe(401);
    });

    test('should not create contact with invalid data', async () => {
      const response = await request(app)
        .post('/api/v1/contact')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          subject: 'AB', // Too short
          message: 'Short', // Too short
          category: 'InvalidCategory',
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/contact/me', () => {
    test('should get user contacts', async () => {
      const response = await request(app)
        .get('/api/v1/contact/me')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('contacts');
      expect(Array.isArray(response.body.contacts)).toBe(true);
    });
  });

  describe('GET /api/v1/contact/testimonials', () => {
    test('should get testimonials', async () => {
      const response = await request(app)
        .get('/api/v1/contact/testimonials');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('testimonials');
      expect(Array.isArray(response.body.testimonials)).toBe(true);
    });
  });
});
