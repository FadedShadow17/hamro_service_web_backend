import { UserRepository } from '../../../repositories/user.repository';
import { UserModel } from '../../../models/user.model';
import { USER_ROLES } from '../../../config/constants';

describe('User Repository Unit Tests', () => {
  const repository = new UserRepository();
  let testUserId: string;

  afterAll(async () => {
    if (testUserId) {
      await UserModel.findByIdAndDelete(testUserId);
    }
    await UserModel.deleteOne({ email: 'testrepo@example.com' });
  });

  describe('createUser', () => {
    test('should create user', async () => {
      const userData = {
        name: 'Test Repo User',
        email: 'testrepo@example.com',
        passwordHash: 'hashedpassword',
        role: USER_ROLES.USER,
      };

      const user = await repository.createUser(userData);
      
      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email.toLowerCase());
      expect(user.name).toBe(userData.name);
      testUserId = user._id.toString();
    });
  });

  describe('findByEmail', () => {
    test('should find user by email', async () => {
      const user = await repository.findByEmail('testrepo@example.com');
      
      expect(user).toBeDefined();
      expect(user?.email).toBe('testrepo@example.com');
    });

    test('should return null for non-existent email', async () => {
      const user = await repository.findByEmail('nonexistent@example.com');
      
      expect(user).toBeNull();
    });
  });

  describe('findById', () => {
    test('should find user by ID', async () => {
      if (!testUserId) {
        const userData = {
          name: 'Test Repo User',
          email: 'testrepo@example.com',
          passwordHash: 'hashedpassword',
          role: USER_ROLES.USER,
        };
        const createdUser = await repository.createUser(userData);
        testUserId = createdUser._id.toString();
      }

      const user = await repository.findById(testUserId);
      
      expect(user).toBeDefined();
      expect(user?._id.toString()).toBe(testUserId);
    });

    test('should return null for invalid ID', async () => {
      const user = await repository.findById('507f1f77bcf86cd799439011');
      
      expect(user).toBeNull();
    });
  });

  describe('updateUser', () => {
    test('should update user', async () => {
      if (!testUserId) {
        return;
      }

      const updatedUser = await repository.updateUser(testUserId, {
        name: 'Updated Name',
      });
      
      expect(updatedUser).toBeDefined();
      expect(updatedUser?.name).toBe('Updated Name');
    });
  });
});
