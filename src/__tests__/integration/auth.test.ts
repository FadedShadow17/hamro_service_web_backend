
import request from 'supertest';
import app from '../../app';
import { User } from '../../models/user.model';

describe('Authentication Integration Tests', () => {
  const testUser = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'Test@1234',
    role: 'user',
  };

  beforeAll(async () => {

    await User.deleteOne({ email: testUser.email });
  });

  afterAll(async () => {

    await User.deleteOne({ email: testUser.email });
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    test('should not register user with existing email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('message');
    });

    test('should not register with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'invalid-email',
        });
      
      expect(response.status).toBe(400);
    });

    test('should not register with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test',
        });
      
      expect(response.status).toBe(400);
    });

    test('should register with phone number', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'testuser2@example.com',
          phone: '+977-9841234567',
        });
      
      expect(response.status).toBe(201);
      await User.deleteOne({ email: 'testuser2@example.com' });
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    test('should not login with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123',
        });
      
      expect(response.status).toBe(401);
    });

    test('should not login with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
        });
      
      expect(response.status).toBe(400);
    });

    test('should not login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123',
        });
      
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });
      authToken = loginResponse.body.token;
    });

    test('should get user info with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
    });

    test('should not get user info without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');
      
      expect(response.status).toBe(401);
    });
  });
});
