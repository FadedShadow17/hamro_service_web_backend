import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.service';
import { HttpError } from '../errors/http-error';
import { USER_ROLES, type UserRole } from '../config/constants';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}


export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  try {

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpError(401, 'Authentication required. Please provide a valid token.');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new HttpError(401, 'Authentication required. Please provide a valid token.');
    }

    const decoded = verifyToken(token);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role as UserRole,
    };

    next();
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid token') {
      next(new HttpError(401, 'Invalid token'));
    } else if (error instanceof Error && error.message === 'Token expired') {
      next(new HttpError(401, 'Token expired'));
    } else {
      next(error);
    }
  }
}


export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new HttpError(401, 'Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new HttpError(403, 'Insufficient permissions'));
    }

    next();
  };
}


export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = verifyToken(token);
        
        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role as UserRole,
        };
      } catch {

      }
    }
    
    next();
  } catch {
    next();
  }
}

export const authenticate = requireAuth;
