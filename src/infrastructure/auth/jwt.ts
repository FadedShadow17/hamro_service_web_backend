import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { env } from '../../config/env';

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export function signToken(payload: TokenPayload, expiresIn?: string): string {
  const options: SignOptions = {
    expiresIn: expiresIn || env.jwtExpiresIn,
  };
  
  return jwt.sign(payload, env.jwtSecret, options);
}

export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    throw error;
  }
}

