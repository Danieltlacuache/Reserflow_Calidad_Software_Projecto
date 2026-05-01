// src/app/api/rooms/availability/route.ts

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AppError } from '@/lib/errors';
import { getInventoryController } from '@/lib/services';
import { AvailabilityQuerySchema } from '@/modules/inventory/inventory.schema';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery: Record<string, string> = Object.fromEntries(searchParams);
    const validated = AvailabilityQuerySchema.parse(rawQuery);
    const result = await getInventoryController().getAvailabilityWithCacheAside({
      roomType: validated.roomType,
      checkIn: new Date(validated.checkIn),
      checkOut: new Date(validated.checkOut),
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
