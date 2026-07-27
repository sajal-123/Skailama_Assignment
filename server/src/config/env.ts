import 'dotenv/config';
import { z } from 'zod';

// Validate and coerce environment variables once at startup so the rest of the
// app can rely on a fully-typed, sane config object instead of raw strings.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGO_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/event-management'),
  CLIENT_ORIGIN: z.string().default('*'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast: a misconfigured environment should never reach a running server.
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

// A "*" origin means allow-all; otherwise treat CLIENT_ORIGIN as a comma-separated allowlist.
export const corsOrigin: string | string[] =
  env.CLIENT_ORIGIN === '*'
    ? '*'
    : env.CLIENT_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);
