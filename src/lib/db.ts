// src/lib/db.ts
import { Pool } from 'pg';
import { validateEnv } from './env';

const env = validateEnv();

// Pool de escritura (nodo primario)
export const writePool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Pool de lectura (réplica de lectura, si está configurada)
export const readPool = new Pool({
  connectionString: env.DATABASE_READ_URL || env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});
