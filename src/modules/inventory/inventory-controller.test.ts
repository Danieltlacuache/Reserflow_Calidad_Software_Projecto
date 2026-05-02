// src/modules/inventory/inventory-controller.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Pool } from 'pg';
import type Redis from 'ioredis';
import { InventoryController } from '@/modules/inventory/inventory-controller';

// ── Mock helpers ───────────────────────────────────────────────────────────────

let mockMultiExec: ReturnType<typeof vi.fn>;

function createMockRedis() {
  mockMultiExec = vi.fn();
  return {
    watch: vi.fn().mockResolvedValue('OK'),
    unwatch: vi.fn().mockResolvedValue('OK'),
    get: vi.fn(),
    set: vi.fn().mockResolvedValue('OK'),
    incrby: vi.fn().mockResolvedValue(1),
    multi: vi.fn().mockReturnValue({
      decrby: vi.fn().mockReturnThis(),
      exec: mockMultiExec,
    }),
  } as unknown as Redis;
}

function createMockPools() {
  const mockClient = {
    query: vi.fn(),
    release: vi.fn(),
  };
  const mockWritePool = {
    connect: vi.fn().mockResolvedValue(mockClient),
    query: vi.fn(),
  } as unknown as Pool;
  const mockReadPool = {
    query: vi.fn(),
  } as unknown as Pool;

  return { mockClient, mockWritePool, mockReadPool };
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('InventoryController', () => {
  let mockRedis: Redis;
  let mockClient: { query: ReturnType<typeof vi.fn>; release: ReturnType<typeof vi.fn> };
  let mockWritePool: Pool;
  let mockReadPool: Pool;
  let controller: InventoryController;

  // Use noon UTC to avoid timezone-shift issues in getDateRange()
  const checkIn = new Date('2025-08-01T12:00:00Z');
  const checkOut = new Date('2025-08-03T12:00:00Z'); // 2 dates: 2025-08-01, 2025-08-02

  beforeEach(() => {
    vi.clearAllMocks();
    mockRedis = createMockRedis();
    const pools = createMockPools();
    mockClient = pools.mockClient;
    mockWritePool = pools.mockWritePool;
    mockReadPool = pools.mockReadPool;
    controller = new InventoryController(mockWritePool, mockReadPool, mockRedis);
  });

  // ── checkAndDecrement() ──────────────────────────────────────────────────

  describe('checkAndDecrement()', () => {
    it('successful decrement returns {success: true}', async () => {
      // For each date: watch, get (has availability), multi.exec succeeds
      (mockRedis.get as ReturnType<typeof vi.fn>).mockResolvedValue('5');
      mockMultiExec.mockResolvedValue([[null, 4]]);
      // After Aurora commit, read remaining
      (mockRedis.get as ReturnType<typeof vi.fn>).mockResolvedValue('4');

      const result = await controller.checkAndDecrement('double', checkIn, checkOut);

      expect(result.success).toBe(true);
      expect(result.remainingCount).toBeGreaterThanOrEqual(0);
      expect(mockRedis.watch).toHaveBeenCalled();
      expect(mockRedis.multi).toHaveBeenCalled();
    });

    it('returns {success: false} when inventory is 0', async () => {
      (mockRedis.get as ReturnType<typeof vi.fn>).mockResolvedValue('0');

      const result = await controller.checkAndDecrement('double', checkIn, checkOut);

      expect(result.success).toBe(false);
      expect(result.reason).toContain('Sin disponibilidad');
    });

    it('retries on WATCH conflict and succeeds on retry', async () => {
      // First date: first attempt conflict (exec returns null), second attempt succeeds
      (mockRedis.get as ReturnType<typeof vi.fn>).mockResolvedValue('5');
      mockMultiExec
        .mockResolvedValueOnce(null) // conflict on first attempt
        .mockResolvedValueOnce([[null, 4]]) // success on retry
        .mockResolvedValueOnce([[null, 4]]); // second date succeeds first try

      const result = await controller.checkAndDecrement('double', checkIn, checkOut);

      expect(result.success).toBe(true);
      // watch should have been called more than 2 times (retries)
      expect((mockRedis.watch as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(2);
    });

    it('compensates Redis if Aurora fails', async () => {
      (mockRedis.get as ReturnType<typeof vi.fn>).mockResolvedValue('5');
      mockMultiExec.mockResolvedValue([[null, 4]]);

      // Make Aurora transaction fail
      mockClient.query.mockRejectedValueOnce(new Error('Aurora down'));

      const result = await controller.checkAndDecrement('double', checkIn, checkOut);

      expect(result.success).toBe(false);
      expect(result.reason).toContain('Error de persistencia');
      // Should have called incrby to compensate
      expect(mockRedis.incrby).toHaveBeenCalled();
    });

    it('fails after MAX_RETRIES exhausted', async () => {
      (mockRedis.get as ReturnType<typeof vi.fn>).mockResolvedValue('5');
      // All exec calls return null (conflict)
      mockMultiExec.mockResolvedValue(null);

      const result = await controller.checkAndDecrement('double', checkIn, checkOut);

      expect(result.success).toBe(false);
      expect(result.reason).toContain('Conflicto de concurrencia');
    });
  });

  // ── incrementOnCancellation() ────────────────────────────────────────────

  describe('incrementOnCancellation()', () => {
    it('increments Redis and Aurora', async () => {
      mockClient.query.mockResolvedValue({ rows: [] });

      await controller.incrementOnCancellation('double', checkIn, checkOut);

      // 2 dates → 2 incrby calls
      expect(mockRedis.incrby).toHaveBeenCalledTimes(2);
      // Aurora: BEGIN + 2 UPDATEs + COMMIT = 4 calls
      expect(mockClient.query).toHaveBeenCalledTimes(4);
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  // ── getAvailability() ────────────────────────────────────────────────────

  describe('getAvailability()', () => {
    it('returns data from Redis', async () => {
      (mockRedis.get as ReturnType<typeof vi.fn>).mockResolvedValue('10');

      const result = await controller.getAvailability({
        roomType: 'double',
        checkIn,
        checkOut,
      });

      // 2 dates for 1 room type
      expect(result).toHaveLength(2);
      expect(result[0].roomType).toBe('double');
      expect(result[0].availableCount).toBe(10);
      expect(result[1].date).toBe('2025-08-02');
    });

    it('returns 0 when Redis key is null', async () => {
      (mockRedis.get as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await controller.getAvailability({
        roomType: 'single',
        checkIn,
        checkOut,
      });

      expect(result).toHaveLength(2);
      expect(result[0].availableCount).toBe(0);
    });

    it('queries all room types when roomType is not specified', async () => {
      (mockRedis.get as ReturnType<typeof vi.fn>).mockResolvedValue('3');

      const result = await controller.getAvailability({ checkIn, checkOut });

      // 4 room types × 2 dates = 8
      expect(result).toHaveLength(8);
    });
  });

  // ── getAvailabilityWithCacheAside() ──────────────────────────────────────

  describe('getAvailabilityWithCacheAside()', () => {
    it('cache hit returns from Redis', async () => {
      (mockRedis.get as ReturnType<typeof vi.fn>).mockResolvedValue('7');

      const result = await controller.getAvailabilityWithCacheAside({
        roomType: 'suite',
        checkIn,
        checkOut,
      });

      expect(result).toHaveLength(2);
      expect(result[0].availableCount).toBe(7);
      // Should NOT have queried Aurora
      expect((mockReadPool as unknown as { query: ReturnType<typeof vi.fn> }).query).not.toHaveBeenCalled();
    });

    it('cache miss queries Aurora and stores in Redis', async () => {
      (mockRedis.get as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (mockReadPool as unknown as { query: ReturnType<typeof vi.fn> }).query.mockResolvedValue({
        rows: [{ available: 12 }],
      });

      const result = await controller.getAvailabilityWithCacheAside({
        roomType: 'deluxe',
        checkIn,
        checkOut,
      });

      expect(result).toHaveLength(2);
      expect(result[0].availableCount).toBe(12);
      // Should have stored in Redis
      expect(mockRedis.set).toHaveBeenCalledWith('inventory:deluxe:2025-08-01', '12');
      expect(mockRedis.set).toHaveBeenCalledWith('inventory:deluxe:2025-08-02', '12');
    });

    it('cache miss with no Aurora rows returns 0', async () => {
      (mockRedis.get as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (mockReadPool as unknown as { query: ReturnType<typeof vi.fn> }).query.mockResolvedValue({
        rows: [],
      });

      const result = await controller.getAvailabilityWithCacheAside({
        roomType: 'single',
        checkIn,
        checkOut,
      });

      expect(result[0].availableCount).toBe(0);
    });
  });

  // ── reconcile() ──────────────────────────────────────────────────────────

  describe('reconcile()', () => {
    it('syncs Redis from Aurora data', async () => {
      (mockReadPool as unknown as { query: ReturnType<typeof vi.fn> }).query.mockResolvedValueOnce({
        rows: [
          { room_type: 'double', date: new Date('2025-08-01'), available: 10 },
          { room_type: 'single', date: new Date('2025-08-02'), available: 5 },
        ],
      });

      await controller.reconcile();

      expect(mockRedis.set).toHaveBeenCalledWith('inventory:double:2025-08-01', '10');
      expect(mockRedis.set).toHaveBeenCalledWith('inventory:single:2025-08-02', '5');
      // Also sets last_sync timestamp
      expect(mockRedis.set).toHaveBeenCalledWith(
        'inventory:last_sync',
        expect.any(String),
      );
    });
  });
});
