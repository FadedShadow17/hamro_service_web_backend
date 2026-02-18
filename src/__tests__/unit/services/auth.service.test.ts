import { hashPassword, comparePassword, signToken, verifyToken } from '../../../services/auth.service';

describe('Auth Service Unit Tests', () => {
  describe('hashPassword', () => {
    test('should hash password', async () => {
      const password = 'TestPassword123';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    test('should produce different hashes for same password', async () => {
      const password = 'TestPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    test('should compare password successfully', async () => {
      const password = 'TestPassword123';
      const hash = await hashPassword(password);
      const result = await comparePassword(password, hash);
      
      expect(result).toBe(true);
    });

    test('should return false for wrong password', async () => {
      const password = 'TestPassword123';
      const wrongPassword = 'WrongPassword123';
      const hash = await hashPassword(password);
      const result = await comparePassword(wrongPassword, hash);
      
      expect(result).toBe(false);
    });
  });

  describe('signToken', () => {
    test('should sign token', () => {
      const payload = {
        id: '123',
        email: 'test@example.com',
        role: 'user',
      };
      
      const token = signToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });
  });

  describe('verifyToken', () => {
    test('should verify valid token', () => {
      const payload = {
        id: '123',
        email: 'test@example.com',
        role: 'user',
      };
      
      const token = signToken(payload);
      const decoded = verifyToken(token);
      
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    test('should throw error for invalid token', () => {
      expect(() => {
        verifyToken('invalid-token');
      }).toThrow();
    });
  });
});
