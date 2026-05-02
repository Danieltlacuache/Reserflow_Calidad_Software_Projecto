// src/modules/reservations/reservation-manager.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Pool } from 'pg';
import { ReservationManager } from '@/modules/reservations/reservation-manager';
import { AppError, InvalidTransitionError, NotFoundError } from '@/lib/errors';
import type { IInventoryController } from '@/modules/inventory/inventory.types';
import type { CreateReservationInput } from '@/modules/reservations/reservation.types';

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockQuery = vi.fn();
const mockWritePool = { query: mockQuery } as unknown as Pool;
const mockReadPool = { query: mockQuery } as unknown as Pool;

const mockInventoryController: IInventoryController = {
  checkAndDecrement: vi.fn(),
  incrementOnCancellation: vi.fn(),
  getAvailability: vi.fn(),
  getAvailabilityWithCacheAside: vi.fn(),
  reconcile: vi.fn(),
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const mockDbRow = {
  id: 'test-uuid',
  room_id: 'room-uuid',
  guest_id: 'guest-uuid',
  room_type: 'double',
  check_in: '2025-08-01',
  check_out: '2025-08-03',
  status: 'Pendiente',
  created_at: '2025-07-15T10:00:00Z',
  updated_at: '2025-07-15T10:00:00Z',
};

const sampleInput: CreateReservationInput = {
  roomId: 'room-uuid',
  checkIn: new Date('2025-08-01'),
  checkOut: new Date('2025-08-03'),
  guestData: { name: 'John Doe', email: 'john@example.com', phone: '1234567890' },
  roomType: 'double',
};

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('ReservationManager', () => {
  let manager: ReservationManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new ReservationManager(mockWritePool, mockReadPool, mockInventoryController);
  });

  // ── create() ───────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('returns a reservation with status "Pendiente", UUID id, and correct fields', async () => {
      // First call: guest upsert RETURNING id
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 'guest-uuid' }] })
        // Second call: reservation INSERT RETURNING *
        .mockResolvedValueOnce({ rows: [mockDbRow] });

      const result = await manager.create(sampleInput);

      expect(result.status).toBe('Pendiente');
      expect(result.id).toBe('test-uuid');
      expect(result.roomId).toBe('room-uuid');
      expect(result.guestId).toBe('guest-uuid');
      expect(result.roomType).toBe('double');
      expect(result.checkIn).toEqual(new Date('2025-08-01'));
      expect(result.checkOut).toEqual(new Date('2025-08-03'));
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });

    it('wraps DB errors in AppError', async () => {
      mockQuery.mockRejectedValueOnce(new Error('connection refused'));

      await expect(manager.create(sampleInput)).rejects.toThrow(AppError);
      await expect(manager.create(sampleInput)).rejects.toThrow(/Error al crear reservación/);
    });
  });

  // ── getById() ──────────────────────────────────────────────────────────────

  describe('getById()', () => {
    it('returns reservation when found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockDbRow] });

      const result = await manager.getById('test-uuid');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('test-uuid');
      expect(result!.status).toBe('Pendiente');
    });

    it('returns null when not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await manager.getById('nonexistent');
      expect(result).toBeNull();
    });

    it('wraps DB errors in AppError', async () => {
      mockQuery.mockRejectedValueOnce(new Error('timeout'));

      await expect(manager.getById('test-uuid')).rejects.toThrow(AppError);
      await expect(manager.getById('test-uuid')).rejects.toThrow(/Error al consultar reservación/);
    });
  });

  // ── getByFilter() ─────────────────────────────────────────────────────────

  describe('getByFilter()', () => {
    it('returns filtered results', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockDbRow] });

      const result = await manager.getByFilter({ status: 'Pendiente' });

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('Pendiente');
    });

    it('handles empty filters', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockDbRow, { ...mockDbRow, id: 'second-uuid' }] });

      const result = await manager.getByFilter({});

      expect(result).toHaveLength(2);
    });

    it('wraps DB errors in AppError', async () => {
      mockQuery.mockRejectedValueOnce(new Error('db error'));

      await expect(manager.getByFilter({})).rejects.toThrow(AppError);
    });
  });

  // ── updateStatus() ────────────────────────────────────────────────────────

  describe('updateStatus()', () => {
    const confirmedRow = { ...mockDbRow, status: 'Confirmada' };
    const cancelledRow = { ...mockDbRow, status: 'Cancelada' };
    const completedRow = { ...mockDbRow, status: 'Completada' };

    it('Pendiente → Confirmada: calls checkAndDecrement and succeeds', async () => {
      // getById
      mockQuery.mockResolvedValueOnce({ rows: [mockDbRow] });
      vi.mocked(mockInventoryController.checkAndDecrement).mockResolvedValueOnce({
        success: true,
        remainingCount: 5,
      });
      // UPDATE RETURNING *
      mockQuery.mockResolvedValueOnce({ rows: [confirmedRow] });

      const result = await manager.updateStatus('test-uuid', 'Confirmada');

      expect(result.status).toBe('Confirmada');
      expect(mockInventoryController.checkAndDecrement).toHaveBeenCalledWith(
        'double',
        new Date('2025-08-01'),
        new Date('2025-08-03'),
      );
    });

    it('Pendiente → Cancelada: succeeds without inventory calls', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockDbRow] });
      mockQuery.mockResolvedValueOnce({ rows: [cancelledRow] });

      const result = await manager.updateStatus('test-uuid', 'Cancelada');

      expect(result.status).toBe('Cancelada');
      expect(mockInventoryController.checkAndDecrement).not.toHaveBeenCalled();
      expect(mockInventoryController.incrementOnCancellation).not.toHaveBeenCalled();
    });

    it('Confirmada → Completada: succeeds', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [confirmedRow] });
      mockQuery.mockResolvedValueOnce({ rows: [completedRow] });

      const result = await manager.updateStatus('test-uuid', 'Completada');

      expect(result.status).toBe('Completada');
    });

    it('Confirmada → Cancelada: calls incrementOnCancellation', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [confirmedRow] });
      vi.mocked(mockInventoryController.incrementOnCancellation).mockResolvedValueOnce(undefined);
      mockQuery.mockResolvedValueOnce({ rows: [cancelledRow] });

      const result = await manager.updateStatus('test-uuid', 'Cancelada');

      expect(result.status).toBe('Cancelada');
      expect(mockInventoryController.incrementOnCancellation).toHaveBeenCalledWith(
        'double',
        new Date('2025-08-01'),
        new Date('2025-08-03'),
      );
    });

    it('rejects Cancelada → Confirmada with InvalidTransitionError', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [cancelledRow] });

      await expect(manager.updateStatus('test-uuid', 'Confirmada')).rejects.toThrow(
        InvalidTransitionError,
      );
    });

    it('rejects Completada → Pendiente with InvalidTransitionError', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [completedRow] });

      await expect(manager.updateStatus('test-uuid', 'Pendiente')).rejects.toThrow(
        InvalidTransitionError,
      );
    });

    it('throws NotFoundError for non-existent reservation', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await expect(manager.updateStatus('nonexistent', 'Confirmada')).rejects.toThrow(
        NotFoundError,
      );
    });

    it('fails when confirming and no availability', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockDbRow] });
      vi.mocked(mockInventoryController.checkAndDecrement).mockResolvedValueOnce({
        success: false,
        remainingCount: 0,
        reason: 'Sin disponibilidad',
      });

      await expect(manager.updateStatus('test-uuid', 'Confirmada')).rejects.toThrow(AppError);
      await expect(
        (async () => {
          mockQuery.mockResolvedValueOnce({ rows: [mockDbRow] });
          vi.mocked(mockInventoryController.checkAndDecrement).mockResolvedValueOnce({
            success: false,
            remainingCount: 0,
            reason: 'Sin disponibilidad',
          });
          await manager.updateStatus('test-uuid', 'Confirmada');
        })(),
      ).rejects.toThrow(/Sin disponibilidad/);
    });
  });

  // ── cancel() ──────────────────────────────────────────────────────────────

  describe('cancel()', () => {
    it('delegates to updateStatus with "Cancelada"', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockDbRow] });
      mockQuery.mockResolvedValueOnce({ rows: [{ ...mockDbRow, status: 'Cancelada' }] });

      const result = await manager.cancel('test-uuid');

      expect(result.status).toBe('Cancelada');
    });
  });
});
