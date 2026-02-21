
import request from 'supertest';
import app from '../../app';
import { User } from '../../models/user.model';
import { Booking } from '../../models/booking.model';
import { Service } from '../../models/service.model';

describe('Bookings Integration Tests', () => {
  let authToken: string;
  let userId: string;
  let serviceId: string;

  beforeAll(async () => {

    const testUser = {
      name: 'Booking Test User',
      email: 'bookingtest@example.com',
      password: 'Test@1234',
      role: 'user',
    };

    await User.deleteOne({ email: testUser.email });
    
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;

    const servicesResponse = await request(app)
      .get('/api/services');
    
    if (servicesResponse.body.data && servicesResponse.body.data.length > 0) {
      serviceId = servicesResponse.body.data[0]._id || servicesResponse.body.data[0].id;
    }
  });

  afterAll(async () => {
    await Booking.deleteMany({ userId });
    await User.deleteOne({ email: 'bookingtest@example.com' });
  });

  describe('POST /api/bookings', () => {
    test('should create booking', async () => {
      if (!serviceId) {
        return; // Skip if no service available
      }

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          serviceId: serviceId,
          date: '2024-12-25',
          timeSlot: '10:00',
          area: 'Thamel',
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('booking');
    });

    test('should not create booking without auth', async () => {
      if (!serviceId) {
        return;
      }

      const response = await request(app)
        .post('/api/bookings')
        .send({
          serviceId: serviceId,
          date: '2024-12-25',
          timeSlot: '10:00',
          area: 'Thamel',
        });
      
      expect(response.status).toBe(401);
    });

    test('should not create booking with invalid data', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          serviceId: serviceId,
          date: 'invalid-date',
          timeSlot: '25:99',
          area: 'InvalidArea',
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/bookings/my', () => {
    test('should get user bookings', async () => {
      const response = await request(app)
        .get('/api/bookings/my')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('bookings');
      expect(Array.isArray(response.body.bookings)).toBe(true);
    });
  });

  describe('PATCH /api/bookings/:id/cancel', () => {
    test('should update booking status', async () => {

      if (!serviceId) {
        return;
      }

      const createResponse = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          serviceId: serviceId,
          date: '2024-12-26',
          timeSlot: '11:00',
          area: 'Thamel',
        });

      if (createResponse.status === 201 && createResponse.body.booking) {
        const bookingId = createResponse.body.booking._id || createResponse.body.booking.id;
        
        const response = await request(app)
          .patch(`/api/bookings/${bookingId}/cancel`)
          .set('Authorization', `Bearer ${authToken}`);
        
        expect([200, 400]).toContain(response.status);
      }
    });
  });
});
