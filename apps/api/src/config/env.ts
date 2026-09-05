import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  DATABASE_URL: z
    .string()
    .default(
      'postgresql://postgres:postgres@localhost:5432/dealflow360?schema=public',
    ),
  JWT_ACCESS_SECRET: z
    .string()
    .default('dealflow360_access_secret_super_secure_key_2026!'),
  JWT_REFRESH_SECRET: z
    .string()
    .default('dealflow360_refresh_secret_super_secure_key_2026!'),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number().default(7),
});

export const env = envSchema.parse(process.env);
