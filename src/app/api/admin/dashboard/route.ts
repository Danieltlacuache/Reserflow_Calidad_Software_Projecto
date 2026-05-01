// src/app/api/admin/dashboard/route.ts

import { NextResponse } from 'next/server';
import { AppError } from '@/lib/errors';
import { getReservationManager, getInventoryController } from '@/lib/services';

export async function GET() {
  try {
    // Query reservations by status
    const rm = getReservationManager();
    const ic = getInventoryController();

    const [active, completed, cancelled] = await Promise.all([
      rm.getByFilter({ status: 'Confirmada' }),
      rm.getByFilter({ status: 'Completada' }),
      rm.getByFilter({ status: 'Cancelada' }),
    ]);

    // Query inventory for occupancy metrics (next 7 days)
    const now = new Date();
    const weekFromNow = new Date(now);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    const availability = await ic.getAvailabilityWithCacheAside({
      checkIn: now,
      checkOut: weekFromNow,
    });

    return NextResponse.json(
      {
        data: {
          reservations: {
            activeCount: active.length,
            completedCount: completed.length,
            cancelledCount: cancelled.length,
          },
          occupancy: availability,
        },
      },
      { status: 200 },
    );
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
