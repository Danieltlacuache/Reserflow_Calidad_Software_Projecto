// src/modules/reservations/reservation-manager.ts

import type { Pool } from 'pg';
import { AppError, InvalidTransitionError, NotFoundError } from '@/lib/errors';
import type { IInventoryController } from '../inventory/inventory.types';
import type {
  CreateReservationInput,
  IReservationManager,
  Reservation,
  ReservationFilter,
  ReservationStatus,
} from './reservation.types';
import { VALID_TRANSITIONS } from './reservation.types';

export class ReservationManager implements IReservationManager {
  constructor(
    private readonly writePool: Pool,
    private readonly readPool: Pool,
    private readonly inventoryController: IInventoryController,
  ) {}

  async create(input: CreateReservationInput): Promise<Reservation> {
    const id = crypto.randomUUID();
    const status: ReservationStatus = 'Pendiente';
    const now = new Date();

    try {
      // Persist guest in guests table (upsert on email)
      const guestResult = await this.writePool.query(
        `INSERT INTO guests (id, name, email, phone, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
         ON CONFLICT (email) DO UPDATE SET
           name = EXCLUDED.name,
           phone = EXCLUDED.phone,
           updated_at = NOW()
         RETURNING id`,
        [input.guestData.name, input.guestData.email, input.guestData.phone],
      );
      const guestId: string = guestResult.rows[0].id as string;

      // Persist reservation in Aurora
      const result = await this.writePool.query(
        `INSERT INTO reservations (id, room_id, guest_id, room_type, check_in, check_out, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [id, input.roomId, guestId, input.roomType, input.checkIn, input.checkOut, status, now, now],
      );

      return this.mapRow(result.rows[0]);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        'DB_ERROR',
        `Error al crear reservación: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        500,
      );
    }
  }

  async getById(id: string): Promise<Reservation | null> {
    try {
      const result = await this.readPool.query(
        'SELECT * FROM reservations WHERE id = $1',
        [id],
      );

      if (result.rows.length === 0) return null;
      return this.mapRow(result.rows[0]);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        'DB_ERROR',
        `Error al consultar reservación: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        500,
      );
    }
  }

  async getByFilter(filter: ReservationFilter): Promise<Reservation[]> {
    try {
      const conditions: string[] = [];
      const params: unknown[] = [];
      let paramIndex = 1;

      if (filter.id) {
        conditions.push(`id = $${paramIndex++}`);
        params.push(filter.id);
      }
      if (filter.status) {
        conditions.push(`status = $${paramIndex++}`);
        params.push(filter.status);
      }
      if (filter.roomId) {
        conditions.push(`room_id = $${paramIndex++}`);
        params.push(filter.roomId);
      }
      if (filter.dateFrom) {
        conditions.push(`check_in >= $${paramIndex++}`);
        params.push(filter.dateFrom);
      }
      if (filter.dateTo) {
        conditions.push(`check_out <= $${paramIndex++}`);
        params.push(filter.dateTo);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const query = `SELECT * FROM reservations ${whereClause} ORDER BY created_at DESC`;

      const result = await this.readPool.query(query, params);
      return result.rows.map((row) => this.mapRow(row));
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        'DB_ERROR',
        `Error al consultar reservaciones: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        500,
      );
    }
  }

  async updateStatus(id: string, newStatus: ReservationStatus): Promise<Reservation> {
    const reservation = await this.getById(id);
    if (!reservation) {
      throw new NotFoundError('Reservación', id);
    }

    const currentStatus = reservation.status;
    const allowedTransitions = VALID_TRANSITIONS[currentStatus];

    if (!allowedTransitions.includes(newStatus)) {
      throw new InvalidTransitionError(currentStatus, newStatus);
    }

    try {
      // If confirming, check and decrement inventory first
      if (newStatus === 'Confirmada') {
        const result = await this.inventoryController.checkAndDecrement(
          reservation.roomType,
          reservation.checkIn,
          reservation.checkOut,
        );
        if (!result.success) {
          throw new AppError(
            'NO_AVAILABILITY',
            result.reason ?? 'Sin disponibilidad para las fechas solicitadas',
            409,
          );
        }
      }

      // If canceling a confirmed reservation, release inventory
      if (newStatus === 'Cancelada' && currentStatus === 'Confirmada') {
        await this.inventoryController.incrementOnCancellation(
          reservation.roomType,
          reservation.checkIn,
          reservation.checkOut,
        );
      }

      // Persist the status change
      const result = await this.writePool.query(
        `UPDATE reservations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [newStatus, id],
      );

      return this.mapRow(result.rows[0]);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        'DB_ERROR',
        `Error al actualizar estado: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        500,
      );
    }
  }

  async cancel(id: string): Promise<Reservation> {
    return this.updateStatus(id, 'Cancelada');
  }

  /** Map a database row to a Reservation object */
  private mapRow(row: Record<string, unknown>): Reservation {
    return {
      id: row.id as string,
      roomId: row.room_id as string,
      checkIn: new Date(row.check_in as string),
      checkOut: new Date(row.check_out as string),
      guestId: row.guest_id as string,
      roomType: row.room_type as Reservation['roomType'],
      status: row.status as Reservation['status'],
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    };
  }
}
