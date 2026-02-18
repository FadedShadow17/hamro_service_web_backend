import { requireAuth } from '../../../middlewares/auth.middleware';
import { signToken } from '../../../services/auth.service';
import { Request, Response, NextFunction } from 'express';

describe('Auth Middleware Unit Tests', () => {
  let mockRequest: any;
  let mockResponse: any;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  describe('requireAuth', () => {
    test('should allow request with valid token', () => {
      const payload = {
        id: '123',
        email: 'test@example.com',
        role: 'user',
      };
      const token = signToken(payload);
      mockRequest.headers.authorization = `Bearer ${token}`;

      requireAuth(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user.id).toBe(payload.id);
    });

    test('should reject request without token', () => {
      requireAuth(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      const error = nextFunction.mock.calls[0][0];
      expect(error).toBeDefined();
    });

    test('should reject request with invalid token', () => {
      mockRequest.headers.authorization = 'Bearer invalid-token';

      requireAuth(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      const error = nextFunction.mock.calls[0][0];
      expect(error).toBeDefined();
    });
  });
});
