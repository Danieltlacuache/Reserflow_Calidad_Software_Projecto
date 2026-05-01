// src/lib/env.ts — Validación de variables de entorno al inicio

import { z } from 'zod';

const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  DATABASE_READ_URL: z.string().url().optional(),
  REDIS_URL: z.string().url(),
  MOCK_AIRBNB_URL: z.string().url(),
  MOCK_BOOKING_URL: z.string().url(),
  MOCK_TIMEOUT_MS: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export type Env = z.infer<typeof EnvSchema>;

export function validateEnv(): Env {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues.map((i) => i.path.join('.')).join(', ');
    throw new Error(`Variables de entorno faltantes o inválidas: ${missing}`);
  }
  return result.data;
}
