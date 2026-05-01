'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ReservationFunnel from '@/components/reservation/ReservationFunnel';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Link from 'next/link';

function ReservationContent() {
  const searchParams = useSearchParams();
  const roomType = searchParams.get('roomType');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');

  if (!roomType || !checkIn || !checkOut) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <Alert variant="warning">
          No se proporcionaron los datos necesarios para la reservación. Por favor busca una habitación primero.
        </Alert>
        <Link href="/">
          <Button>Ir al buscador</Button>
        </Link>
      </div>
    );
  }

  return <ReservationFunnel roomType={roomType} checkIn={checkIn} checkOut={checkOut} />;
}

export default function ReservationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reservación</h1>
        <p className="text-gray-600 mt-1">Completa tu reservación en pocos pasos</p>
      </header>
      <main>
        <Suspense fallback={<div className="text-center py-8 text-gray-500">Cargando...</div>}>
          <ReservationContent />
        </Suspense>
      </main>
    </div>
  );
}
