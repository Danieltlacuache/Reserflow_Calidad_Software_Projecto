// src/modules/inventory/inventory.types.ts

import type { RoomType } from '../reservations/reservation.types';

export interface RoomAvailability {
  roomType: RoomType;
  date: string; // formato YYYY-MM-DD
  availableCount: number;
}

export interface AvailabilityQuery {
  roomType?: RoomType;
  checkIn: Date;
  checkOut: Date;
}

export interface DecrementResult {
  success: boolean;
  remainingCount: number;
  reason?: string;
}

export interface InventoryState {
  roomType: RoomType;
  date: string;
  count: number;
}

export interface IInventoryController {
  /** Verifica y decrementa inventario atómicamente en Redis (WATCH/MULTI/EXEC) */
  checkAndDecrement(roomType: RoomType, checkIn: Date, checkOut: Date): Promise<DecrementResult>;

  /** Incrementa inventario al cancelar una reservación */
  incrementOnCancellation(roomType: RoomType, checkIn: Date, checkOut: Date): Promise<void>;

  /** Consulta disponibilidad por tipo y rango de fechas */
  getAvailability(query: AvailabilityQuery): Promise<RoomAvailability[]>;

  /** Patrón Cache-Aside: consulta Redis, fallback a Aurora */
  getAvailabilityWithCacheAside(query: AvailabilityQuery): Promise<RoomAvailability[]>;

  /** Sincroniza estado de Redis con Aurora (reconciliación) */
  reconcile(): Promise<void>;
}
