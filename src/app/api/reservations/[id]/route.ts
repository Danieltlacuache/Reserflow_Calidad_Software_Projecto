// src/app/api/reservations/[id]/route.ts

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AppError } from '@/lib/errors';
import { getReservationManager } from '@/lib/services';
import { UpdateStatusSchema } from '@/modules/reservations/reservation.schema';

interface RouteContext {
  params: { id: string };
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = context.params;
    const reservation = await getReservationManager().getById(id);
    if (!reservation) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: `Reservación con id ${id} no encontrada` } },
        { status: 404 },
      );
    }
    return NextResponse.json({ data: reservation }, { status: 200 });
  } catch (error) {
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

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = context.params;
    const body: unknown = await request.json();
    const validated = UpdateStatusSchema.parse(body);
    const result = await getReservationManager().updateStatus(id, validated.status);
    return NextResponse.json({ data: result }, { status: 200 });
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

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = context.params;
    const reservation = await getReservationManager().getById(id);
    if (!reservation) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: `Reservación con id ${id} no encontrada` } },
        { status: 404 },
      );
    }
    const result = await getReservationManager().cancel(id);
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
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
