// src/lib/services.ts — Lazy singleton instances of business modules

import type { ReservationManager } from '@/modules/reservations/reservation-manager';
import type { InventoryController } from '@/modules/inventory/inventory-controller';

let _reservationManager: ReservationManager | null = null;
let _inventoryController: InventoryController | null = null;

function initServices() {
  if (!_inventoryController || !_reservationManager) {
    // Dynamic imports to avoid eager env validation at build time
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { writePool, readPool } = require('./db') as typeof import('./db');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { redis } = require('./redis') as typeof import('./redis');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { InventoryController: IC } = require('@/modules/inventory/inventory-controller') as typeof import('@/modules/inventory/inventory-controller');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ReservationManager: RM } = require('@/modules/reservations/reservation-manager') as typeof import('@/modules/reservations/reservation-manager');

    _inventoryController = new IC(writePool, readPool, redis);
    _reservationManager = new RM(writePool, readPool, _inventoryController);
  }
  return { reservationManager: _reservationManager, inventoryController: _inventoryController };
}

export function getReservationManager(): ReservationManager {
  return initServices().reservationManager;
}

export function getInventoryController(): InventoryController {
  return initServices().inventoryController;
}
