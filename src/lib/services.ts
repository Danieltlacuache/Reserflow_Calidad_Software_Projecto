// src/lib/services.ts — Lazy singleton instances of business modules

import { Pool } from 'pg';
import Redis from 'ioredis';
import { InventoryController } from '@/modules/inventory/inventory-controller';
import { ReservationManager } from '@/modules/reservations/reservation-manager';

let _reservationManager: ReservationManager | null = null;
let _inventoryController: InventoryController | null = null;
let _writePool: Pool | null = null;
let _readPool: Pool | null = null;
let _redis: Redis | null = null;

function getWritePool(): Pool {
  if (!_writePool) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error('DATABASE_URL no está configurada');
    _writePool = new Pool({
      connectionString: dbUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return _writePool;
}

function getReadPool(): Pool {
  if (!_readPool) {
    const dbUrl = process.env.DATABASE_READ_URL || process.env.DATABASE_URL;
    if (!dbUrl) throw new Error('DATABASE_URL no está configurada');
    _readPool = new Pool({
      connectionString: dbUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return _readPool;
}

function getRedis(): Redis {
  if (!_redis) {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) throw new Error('REDIS_URL no está configurada');
    _redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        return Math.min(times * 50, 2000);
      },
    });
  }
  return _redis;
}

export function getInventoryController(): InventoryController {
  if (!_inventoryController) {
    _inventoryController = new InventoryController(getWritePool(), getReadPool(), getRedis());
  }
  return _inventoryController;
}

export function getReservationManager(): ReservationManager {
  if (!_reservationManager) {
    _reservationManager = new ReservationManager(getWritePool(), getReadPool(), getInventoryController());
  }
  return _reservationManager;
}
