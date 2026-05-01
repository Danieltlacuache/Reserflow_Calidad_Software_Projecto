// src/modules/reservations/reservation.schema.ts

import { z } from 'zod';

export const CreateReservationSchema = z
  .object({
    roomId: z.string().uuid(),
    checkIn: z.string().datetime(),
    checkOut: z.string().datetime(),
    guestData: z.object({
      name: z.string().min(1).max(200),
      email: z.string().email(),
      phone: z.string().min(7).max(20),
    }),
    roomType: z.enum(['single', 'double', 'suite', 'deluxe']),
  })
  .refine((data) => new Date(data.checkOut) > new Date(data.checkIn), {
    message: 'checkOut debe ser posterior a checkIn',
  });

export const UpdateStatusSchema = z.object({
  status: z.enum(['Confirmada', 'Cancelada', 'Completada']),
});

export const ReservationFilterSchema = z.object({
  status: z.enum(['Pendiente', 'Confirmada', 'Cancelada', 'Completada']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  roomId: z.string().uuid().optional(),
});
