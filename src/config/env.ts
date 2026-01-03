import { config } from 'dotenv';

// Load environment variables from .env file
config();

interface EnvConfig {
  port: number;
  mongodbUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptSaltRounds: number;
}

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue!;
}

function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  const numValue = value ? parseInt(value, 10) : defaultValue!;
  if (isNaN(numValue)) {
    throw new Error(`Invalid number for environment variable: ${key}`);
  }
  return numValue;
}

export const env: EnvConfig = {
  port: getEnvNumber('PORT', 4000),
  mongodbUri: getEnv('MONGODB_URI', 'mongodb+srv://dahalrojit1700:Whatsup!1@cluster0.rkfblb5.mongodb.net/hamro__service_web'),
  jwtSecret: getEnv('JWT_SECRET', 'change-me'),
  jwtExpiresIn: getEnv('JWT_EXPIRES_IN', '1d'),
  bcryptSaltRounds: getEnvNumber('BCRYPT_SALT_ROUNDS', 10),
};

