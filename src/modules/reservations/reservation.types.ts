// src/modules/reservations/reservation.types.ts

export type ReservationStatus = 'Pendiente' | 'Confirmada' | 'Cancelada' | 'Completada';

export type RoomType = 'single' | 'double' | 'suite' | 'deluxe';

export interface GuestInput {
  name: string;
  email: string;
  phone: string;
}

export interface CreateReservationInput {
  roomId: string;
  checkIn: Date;
  checkOut: Date;
  guestData: GuestInput;
  roomType: RoomType;
}

export interface Reservation {
  id: string;
  roomId: string;
  checkIn: Date;
  checkOut: Date;
  guestId: string;
  roomType: RoomType;
  status: ReservationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReservationFilter {
  id?: string;
  status?: ReservationStatus;
  dateFrom?: Date;
  dateTo?: Date;
  roomId?: string;
}

/** Valid state transitions for the reservation state machine */
export const VALID_TRANSITIONS: Record<ReservationStatus, ReservationStatus[]> = {
  Pendiente: ['Confirmada', 'Cancelada'],
  Confirmada: ['Cancelada', 'Completada'],
  Cancelada: [],
  Completada: [],
};

export interface IReservationManager {
  create(input: CreateReservationInput): Promise<Reservation>;
  getById(id: string): Promise<Reservation | null>;
  getByFilter(filter: ReservationFilter): Promise<Reservation[]>;
  updateStatus(id: string, newStatus: ReservationStatus): Promise<Reservation>;
  cancel(id: string): Promise<Reservation>;
}
