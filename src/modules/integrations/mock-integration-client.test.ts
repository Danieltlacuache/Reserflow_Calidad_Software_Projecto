// src/modules/integrations/mock-integration-client.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MockIntegrationClient } from '@/modules/integrations/mock-integration-client';
import { AppError, IntegrationTimeoutError } from '@/lib/errors';

// ── Mock axios ─────────────────────────────────────────────────────────────────

const mockGet = vi.fn();

vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn(() => ({
        get: mockGet,
      })),
      isAxiosError: (error: unknown): error is { code?: string; response?: { status: number } } => {
        return (
          error !== null &&
          typeof error === 'object' &&
          '__isAxiosError' in (error as Record<string, unknown>)
        );
      },
    },
  };
});

// Helper to create an axios-like error
function createAxiosError(opts: { code?: string; status?: number }) {
  const err: Record<string, unknown> = {
    __isAxiosError: true,
    message: 'Request failed',
    code: opts.code,
    response: opts.status ? { status: opts.status } : undefined,
  };
  return err;
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('MockIntegrationClient', () => {
  let client: MockIntegrationClient;

  const checkIn = new Date('2025-08-01');
  const checkOut = new Date('2025-08-03');

  beforeEach(() => {
    vi.clearAllMocks();
    client = new MockIntegrationClient(
      { baseUrl: 'http://mock-airbnb:3001', timeoutMs: 5000 },
      { baseUrl: 'http://mock-booking:3002', timeoutMs: 5000 },
    );
  });

  // ── getAirbnbAvailability() ──────────────────────────────────────────────

  describe('getAirbnbAvailability()', () => {
    it('successful response transforms data correctly', async () => {
      mockGet.mockResolvedValueOnce({
        status: 200,
        data: [
          { roomType: 'double', available: true, price: 120, currency: 'USD' },
          { room_type: 'single', available: false, price: 80, currency: 'EUR' },
        ],
      });

      const result = await client.getAirbnbAvailability('double', checkIn, checkOut);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        platform: 'airbnb',
        roomType: 'double',
        available: true,
        price: 120,
        currency: 'USD',
      });
      expect(result[1]).toEqual({
        platform: 'airbnb',
        roomType: 'single',
        available: false,
        price: 80,
        currency: 'EUR',
      });
    });
  });

  // ── getBookingAvailability() ─────────────────────────────────────────────

  describe('getBookingAvailability()', () => {
    it('successful response transforms data correctly', async () => {
      mockGet.mockResolvedValueOnce({
        status: 200,
        data: [{ roomType: 'suite', available: true, price: 250, currency: 'USD' }],
      });

      const result = await client.getBookingAvailability('suite', checkIn, checkOut);

      expect(result).toHaveLength(1);
      expect(result[0].platform).toBe('booking');
      expect(result[0].roomType).toBe('suite');
      expect(result[0].available).toBe(true);
      expect(result[0].price).toBe(250);
    });
  });

  // ── Error handling ───────────────────────────────────────────────────────

  describe('error handling', () => {
    it('handles timeout errors (ECONNABORTED) with IntegrationTimeoutError', async () => {
      mockGet.mockRejectedValueOnce(createAxiosError({ code: 'ECONNABORTED' }));

      await expect(
        client.getAirbnbAvailability('double', checkIn, checkOut),
      ).rejects.toThrow(IntegrationTimeoutError);
    });

    it('handles ETIMEDOUT errors with IntegrationTimeoutError', async () => {
      mockGet.mockRejectedValueOnce(createAxiosError({ code: 'ETIMEDOUT' }));

      await expect(
        client.getBookingAvailability('double', checkIn, checkOut),
      ).rejects.toThrow(IntegrationTimeoutError);
    });

    it('handles HTTP 400 errors with AppError', async () => {
      mockGet.mockRejectedValueOnce(createAxiosError({ status: 400 }));

      await expect(
        client.getAirbnbAvailability('double', checkIn, checkOut),
      ).rejects.toThrow(AppError);

      mockGet.mockRejectedValueOnce(createAxiosError({ status: 400 }));
      await expect(
        client.getAirbnbAvailability('double', checkIn, checkOut),
      ).rejects.toThrow(/solicitud inválida/);
    });

    it('handles HTTP 500 errors with AppError', async () => {
      mockGet.mockRejectedValueOnce(createAxiosError({ status: 500 }));

      await expect(
        client.getBookingAvailability('double', checkIn, checkOut),
      ).rejects.toThrow(AppError);

      mockGet.mockRejectedValueOnce(createAxiosError({ status: 500 }));
      await expect(
        client.getBookingAvailability('double', checkIn, checkOut),
      ).rejects.toThrow(/servicio no disponible/);
    });

    it('handles unknown errors with AppError', async () => {
      mockGet.mockRejectedValueOnce(new Error('network failure'));

      await expect(
        client.getAirbnbAvailability('double', checkIn, checkOut),
      ).rejects.toThrow(AppError);

      mockGet.mockRejectedValueOnce(new Error('something weird'));
      await expect(
        client.getAirbnbAvailability('double', checkIn, checkOut),
      ).rejects.toThrow(/Error inesperado/);
    });
  });
});
