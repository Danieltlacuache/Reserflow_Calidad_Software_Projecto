'use client';

import React from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';

interface ConfirmationViewProps {
  success: boolean;
  reservationId?: string;
  roomType?: string;
  checkIn?: string;
  checkOut?: string;
  guestName?: string;
  errorMessage?: string;
  onNewReservation: () => void;
}

export default function ConfirmationView({
  success,
  reservationId,
  roomType,
  checkIn,
  checkOut,
  guestName,
  errorMessage,
  onNewReservation,
}: ConfirmationViewProps) {
  if (success) {
    return (
      <div className="space-y-4">
        <Alert variant="success">
          <p className="font-semibold">¡Reservación creada exitosamente!</p>
        </Alert>
        <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-2">
          <p className="text-sm text-gray-600">ID de reservación: <span className="font-mono font-medium text-gray-900">{reservationId}</span></p>
          <p className="text-sm text-gray-600">Tipo de habitación: <span className="font-medium text-gray-900 capitalize">{roomType}</span></p>
          <p className="text-sm text-gray-600">Check-in: <span className="font-medium text-gray-900">{checkIn}</span></p>
          <p className="text-sm text-gray-600">Check-out: <span className="font-medium text-gray-900">{checkOut}</span></p>
          <p className="text-sm text-gray-600">Huésped: <span className="font-medium text-gray-900">{guestName}</span></p>
          <p className="text-sm text-gray-600">Estado: <span className="font-medium text-yellow-700">Pendiente</span></p>
        </div>
        <Button onClick={onNewReservation}>Nueva reservación</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Alert variant="error">
        <p className="font-semibold">Error al crear la reservación</p>
        <p className="text-sm mt-1">{errorMessage || 'Ocurrió un error inesperado. Intenta de nuevo.'}</p>
      </Alert>
      <Button onClick={onNewReservation}>Intentar de nuevo</Button>
    </div>
  );
}
