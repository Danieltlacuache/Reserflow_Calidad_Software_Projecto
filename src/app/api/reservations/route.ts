// src/app/api/reservations/route.ts

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AppError } from '@/lib/errors';
import { getReservationManager } from '@/lib/services';
import {
  CreateReservationSchema,
  ReservationFilterSchema,
} from '@/modules/reservations/reservation.schema';

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const validated = CreateReservationSchema.parse(body);
    const result = await getReservationManager().create({
      ...validated,
      checkIn: new Date(validated.checkIn),
      checkOut: new Date(validated.checkOut),
    });
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Datos de entrada inválidos',
            details: error.issues.map((i) => ({
              field: i.path.join('.'),
              message: i.message,
            })),
          },
        },
        { status: 400 },
      );
    }
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.statusCode },
      );
    }
    console.error('Error interno:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawFilter: Record<string, string> = Object.fromEntries(searchParams);
    const validated = ReservationFilterSchema.parse(rawFilter);
    const result = await getReservationManager().getByFilter({
      ...validated,
      dateFrom: validated.dateFrom ? new Date(validated.dateFrom) : undefined,
      dateTo: validated.dateTo ? new Date(validated.dateTo) : undefined,
    });
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Parámetros de consulta inválidos',
            details: error.issues.map((i) => ({
              field: i.path.join('.'),
              message: i.message,
            })),
          },
        },
        { status: 400 },
      );
    }
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.statusCode },
      );
    }
    console.error('Error interno:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } },
      { status: 500 },
    );
  }
}
