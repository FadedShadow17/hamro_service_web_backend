import { UserModel } from '../../../models/user.model';
import { USER_ROLES } from '../../../config/constants';

describe('User Model Unit Tests', () => {
  afterAll(async () => {
    await UserModel.deleteMany({ email: /test.*@example\.com/ });
  });

  describe('User validation', () => {
    test('should create user with valid data', async () => {
      const userData = {
        name: 'Test User',
        email: 'testuser@example.com',
        passwordHash: 'hashedpassword',
        role: USER_ROLES.USER,
      };

      const user = new UserModel(userData);
      const savedUser = await user.save();

      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.email).toBe(userData.email.toLowerCase());
      await UserModel.findByIdAndDelete(savedUser._id);
    });

    test('should enforce email uniqueness', async () => {
      const userData = {
        name: 'Test User',
        email: 'unique@example.com',
        passwordHash: 'hashedpassword',
        role: USER_ROLES.USER,
      };

      const user1 = new UserModel(userData);
      await user1.save();

      const user2 = new UserModel(userData);
      await expect(user2.save()).rejects.toThrow();

      await UserModel.deleteOne({ email: 'unique@example.com' });
    });

    test('should validate phone format', async () => {
      const userData = {
        name: 'Test User',
        email: 'phone@example.com',
        passwordHash: 'hashedpassword',
        role: USER_ROLES.USER,
        phone: '+977-9841234567',
      };

      const user = new UserModel(userData);
      const savedUser = await user.save();

      expect(savedUser.phone).toBe(userData.phone);
      await UserModel.findByIdAndDelete(savedUser._id);
    });
  });
});
