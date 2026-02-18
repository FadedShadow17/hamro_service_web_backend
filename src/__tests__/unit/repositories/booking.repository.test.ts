import { BookingRepository } from '../../../repositories/booking.repository';
import { Booking } from '../../../models/booking.model';
import { UserModel } from '../../../models/user.model';
import { Service } from '../../../models/service.model';
import { BOOKING_STATUS } from '../../../config/constants';

describe('Booking Repository Unit Tests', () => {
  const repository = new BookingRepository();
  let testUserId: string;
  let testServiceId: string;

  beforeAll(async () => {
    // Create test user
    const testUser = await UserModel.create({
      name: 'Booking Repo Test',
      email: 'bookingrepo@example.com',
      passwordHash: 'hashed',
      role: 'user',
    });
    testUserId = testUser._id.toString();

    // Get or create a test service
    const services = await Service.find().limit(1);
    if (services.length > 0) {
      testServiceId = services[0]._id.toString();
    }
  });

  afterAll(async () => {
    await Booking.deleteMany({ userId: testUserId });
    await UserModel.deleteOne({ email: 'bookingrepo@example.com' });
  });

  describe('create', () => {
    test('should create booking', async () => {
      if (!testServiceId) {
        return;
      }

      const booking = await repository.create({
        userId: testUserId,
        serviceId: testServiceId,
        date: '2024-12-25',
        timeSlot: '10:00',
        area: 'Thamel',
        status: BOOKING_STATUS.PENDING,
        paymentStatus: 'UNPAID',
      });

      expect(booking).toBeDefined();
      expect(booking.date).toBe('2024-12-25');
    });
  });

  describe('findByUserId', () => {
    test('should find bookings by user ID', async () => {
      const bookings = await repository.findByUserId(testUserId);
      
      expect(Array.isArray(bookings)).toBe(true);
    });
  });

  describe('update', () => {
    test('should update booking status', async () => {
      if (!testServiceId) {
        return;
      }

      const booking = await repository.create({
        userId: testUserId,
        serviceId: testServiceId,
        date: '2024-12-26',
        timeSlot: '11:00',
        area: 'Thamel',
        status: BOOKING_STATUS.PENDING,
        paymentStatus: 'UNPAID',
      });

      const updated = await repository.update(booking.id, {
        status: BOOKING_STATUS.CONFIRMED,
      });

      expect(updated).toBeDefined();
      expect(updated?.status).toBe(BOOKING_STATUS.CONFIRMED);
    });
  });
});
