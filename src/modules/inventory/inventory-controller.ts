// src/modules/inventory/inventory-controller.ts

import type { Pool } from 'pg';
import type Redis from 'ioredis';
import type { RoomType } from '../reservations/reservation.types';
import type {
  IInventoryController,
  RoomAvailability,
  AvailabilityQuery,
  DecrementResult,
} from './inventory.types';

const MAX_RETRIES = 3;

export class InventoryController implements IInventoryController {
  constructor(
    private readonly writePool: Pool,
    private readonly readPool: Pool,
    private readonly redis: Redis,
  ) {}

  /**
   * Generates an array of YYYY-MM-DD strings from checkIn (inclusive) to checkOut (exclusive).
   */
  private getDateRange(checkIn: Date, checkOut: Date): string[] {
    const dates: string[] = [];
    const current = new Date(checkIn);
    const end = new Date(checkOut);

    while (current < end) {
      const yyyy = current.getFullYear();
      const mm = String(current.getMonth() + 1).padStart(2, '0');
      const dd = String(current.getDate()).padStart(2, '0');
      dates.push(`${yyyy}-${mm}-${dd}`);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  /**
   * Returns the Redis key for a given room type and date.
   */
  private redisKey(roomType: RoomType, date: string): string {
    return `inventory:${roomType}:${date}`;
  }

  async checkAndDecrement(
    roomType: RoomType,
    checkIn: Date,
    checkOut: Date,
  ): Promise<DecrementResult> {
    const dates = this.getDateRange(checkIn, checkOut);
    const succeededDates: string[] = [];

    for (const date of dates) {
      const key = this.redisKey(roomType, date);
      let success = false;

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        await this.redis.watch(key);
        const currentStr = await this.redis.get(key);
        const current = currentStr !== null ? parseInt(currentStr, 10) : 0;

        if (current <= 0) {
          await this.redis.unwatch();
          // Compensate already-decremented dates
          await this.compensateRedis(roomType, succeededDates);
          return { success: false, remainingCount: 0, reason: 'Sin disponibilidad' };
        }

        const multi = this.redis.multi();
        multi.decrby(key, 1);
        const result = await multi.exec();

        if (result !== null) {
          success = true;
          break;
        }
        // EXEC returned null — conflict, retry
      }

      if (!success) {
        // Exhausted retries for this date — compensate and fail
        await this.compensateRedis(roomType, succeededDates);
        return {
          success: false,
          remainingCount: 0,
          reason: 'Conflicto de concurrencia después de reintentos',
        };
      }

      succeededDates.push(date);
    }

    // All dates decremented in Redis — persist to Aurora
    try {
      const client = await this.writePool.connect();
      try {
        await client.query('BEGIN');
        for (const date of dates) {
          await client.query(
            'UPDATE room_inventory SET available = available - 1 WHERE room_type = $1 AND date = $2',
            [roomType, date],
          );
        }
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch {
      // Aurora failed — compensate Redis
      await this.compensateRedis(roomType, succeededDates);
      return { success: false, remainingCount: 0, reason: 'Error de persistencia' };
    }

    // Read remaining count from the last date key
    const lastKey = this.redisKey(roomType, dates[dates.length - 1]);
    const remainingStr = await this.redis.get(lastKey);
    const remainingCount = remainingStr !== null ? parseInt(remainingStr, 10) : 0;

    return { success: true, remainingCount };
  }

  /**
   * Compensates Redis by incrementing back each date that was already decremented.
   */
  private async compensateRedis(roomType: RoomType, dates: string[]): Promise<void> {
    for (const date of dates) {
      await this.redis.incrby(this.redisKey(roomType, date), 1);
    }
  }

  async incrementOnCancellation(
    roomType: RoomType,
    checkIn: Date,
    checkOut: Date,
  ): Promise<void> {
    const dates = this.getDateRange(checkIn, checkOut);

    // Increment in Redis
    for (const date of dates) {
      await this.redis.incrby(this.redisKey(roomType, date), 1);
    }

    // Persist to Aurora
    const client = await this.writePool.connect();
    try {
      await client.query('BEGIN');
      for (const date of dates) {
        await client.query(
          'UPDATE room_inventory SET available = available + 1 WHERE room_type = $1 AND date = $2',
          [roomType, date],
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getAvailability(query: AvailabilityQuery): Promise<RoomAvailability[]> {
    const dates = this.getDateRange(query.checkIn, query.checkOut);
    const results: RoomAvailability[] = [];

    const roomTypes: RoomType[] = query.roomType
      ? [query.roomType]
      : ['single', 'double', 'suite', 'deluxe'];

    for (const rt of roomTypes) {
      for (const date of dates) {
        const key = this.redisKey(rt, date);
        const val = await this.redis.get(key);
        results.push({
          roomType: rt,
          date,
          availableCount: val !== null ? parseInt(val, 10) : 0,
        });
      }
    }

    return results;
  }

  async getAvailabilityWithCacheAside(query: AvailabilityQuery): Promise<RoomAvailability[]> {
    const dates = this.getDateRange(query.checkIn, query.checkOut);
    const results: RoomAvailability[] = [];

    const roomTypes: RoomType[] = query.roomType
      ? [query.roomType]
      : ['single', 'double', 'suite', 'deluxe'];

    for (const rt of roomTypes) {
      for (const date of dates) {
        const key = this.redisKey(rt, date);
        const cached = await this.redis.get(key);

        if (cached !== null) {
          // Cache hit
          results.push({
            roomType: rt,
            date,
            availableCount: parseInt(cached, 10),
          });
        } else {
          // Cache miss — query Aurora
          const dbResult = await this.readPool.query(
            'SELECT available FROM room_inventory WHERE room_type = $1 AND date = $2',
            [rt, date],
          );

          const available = dbResult.rows.length > 0 ? (dbResult.rows[0].available as number) : 0;

          // Store in Redis
          await this.redis.set(key, available.toString());

          results.push({
            roomType: rt,
            date,
            availableCount: available,
          });
        }
      }
    }

    return results;
  }

  async reconcile(): Promise<void> {
    // Query Aurora for all active inventory dates
    const dbResult = await this.readPool.query(
      'SELECT room_type, date, available FROM room_inventory WHERE date >= CURRENT_DATE',
    );

    for (const row of dbResult.rows) {
      const roomType = row.room_type as RoomType;
      const date = (row.date as Date).toISOString().split('T')[0];
      const available = row.available as number;
      const key = this.redisKey(roomType, date);

      await this.redis.set(key, available.toString());
    }

    // Update last sync timestamp
    await this.redis.set('inventory:last_sync', Math.floor(Date.now() / 1000).toString());
  }
}
