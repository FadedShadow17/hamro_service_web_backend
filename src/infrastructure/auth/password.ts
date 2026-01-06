import bcrypt from 'bcrypt';
import { env } from '../../config/env';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, env.bcryptSaltRounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

