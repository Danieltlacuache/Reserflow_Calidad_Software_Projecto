// src/lib/env.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// We need to re-import validateEnv fresh each time because zod reads process.env at parse time.
// We'll use dynamic import to avoid module caching issues.

describe('validateEnv', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    // Start with a clean env for each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const validEnv = {
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
    REDIS_URL: 'redis://localhost:6379',
    MOCK_AIRBNB_URL: 'http://localhost:3001',
    MOCK_BOOKING_URL: 'http://localhost:3002',
  };

  it('succeeds with all required variables', async () => {
    Object.assign(process.env, validEnv);
    const { validateEnv } = await import('@/lib/env');
    const env = validateEnv();
    expect(env.DATABASE_URL).toBe(validEnv.DATABASE_URL);
    expect(env.REDIS_URL).toBe(validEnv.REDIS_URL);
    expect(env.MOCK_AIRBNB_URL).toBe(validEnv.MOCK_AIRBNB_URL);
    expect(env.MOCK_BOOKING_URL).toBe(validEnv.MOCK_BOOKING_URL);
  });

  it('throws when DATABASE_URL is missing', async () => {
    const { DATABASE_URL: _, ...envWithout } = validEnv;
    Object.assign(process.env, envWithout);
    // Make sure DATABASE_URL is not set
    delete process.env.DATABASE_URL;
    const { validateEnv } = await import('@/lib/env');
    expect(() => validateEnv()).toThrow('Variables de entorno faltantes o inválidas');
  });

  it('throws when REDIS_URL is missing', async () => {
    const { REDIS_URL: _, ...envWithout } = validEnv;
    Object.assign(process.env, envWithout);
    delete process.env.REDIS_URL;
    const { validateEnv } = await import('@/lib/env');
    expect(() => validateEnv()).toThrow('Variables de entorno faltantes o inválidas');
  });

  it('uses default for MOCK_TIMEOUT_MS when not provided', async () => {
    Object.assign(process.env, validEnv);
    delete process.env.MOCK_TIMEOUT_MS;
    const { validateEnv } = await import('@/lib/env');
    const env = validateEnv();
    expect(env.MOCK_TIMEOUT_MS).toBe(5000);
  });

  it('uses default for NODE_ENV when not provided', async () => {
    Object.assign(process.env, validEnv);
    delete process.env.NODE_ENV;
    const { validateEnv } = await import('@/lib/env');
    const env = validateEnv();
    expect(env.NODE_ENV).toBe('development');
  });

  it('parses MOCK_TIMEOUT_MS as a number', async () => {
    Object.assign(process.env, { ...validEnv, MOCK_TIMEOUT_MS: '3000' });
    const { validateEnv } = await import('@/lib/env');
    const env = validateEnv();
    expect(env.MOCK_TIMEOUT_MS).toBe(3000);
  });
});
