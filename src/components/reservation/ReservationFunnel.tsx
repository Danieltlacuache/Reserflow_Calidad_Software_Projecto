'use client';

import React, { useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import GuestForm, { type GuestData } from './GuestForm';
import ConfirmationView from './ConfirmationView';

interface ReservationFunnelProps {
  roomType: string;
  checkIn: string;
  checkOut: string;
}

const roomLabels: Record<string, string> = {
  single: 'Single',
  double: 'Double',
  suite: 'Suite',
  deluxe: 'Deluxe',
};

const roomPrices: Record<string, number> = {
  single: 800,
  double: 1200,
  suite: 2500,
  deluxe: 4000,
};

export default function ReservationFunnel({ roomType, checkIn, checkOut }: ReservationFunnelProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [guestData, setGuestData] = useState<GuestData | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; reservationId?: string; error?: string } | null>(null);

  const nights = Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)));
  const price = roomPrices[roomType] || 0;

  const handleGuestSubmit = (data: GuestData) => {
    setGuestData(data);
    setStep(3);
    submitReservation(data);
  };

  const submitReservation = async (guest: GuestData) => {
    setLoading(true);
    setResult(null);
    try {
      // Use a placeholder roomId (UUID) since the API expects one
      const body = {
        roomId: '00000000-0000-0000-0000-000000000001',
        checkIn: new Date(checkIn).toISOString(),
        checkOut: new Date(checkOut).toISOString(),
        guestData: guest,
        roomType,
      };
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (res.ok) {
        setResult({ success: true, reservationId: json.data?.id });
      } else {
        setResult({ success: false, error: json.error?.message || 'Error al crear la reservación.' });
      }
    } catch {
      setResult({ success: false, error: 'No se pudo conectar con el servidor.' });
    } finally {
      setLoading(false);
    }
  };

  const handleNewReservation = () => {
    setStep(1);
    setGuestData(null);
    setResult(null);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {s}
            </div>
            {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Room selection summary */}
      {step === 1 && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Resumen de selección</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Tipo: <span className="font-medium text-gray-900">{roomLabels[roomType] || roomType}</span></p>
            <p>Check-in: <span className="font-medium text-gray-900">{checkIn}</span></p>
            <p>Check-out: <span className="font-medium text-gray-900">{checkOut}</span></p>
            <p>Noches: <span className="font-medium text-gray-900">{nights}</span></p>
            <p>Precio total: <span className="font-bold text-gray-900">${(price * nights).toLocaleString()}</span></p>
          </div>
          <Button onClick={() => setStep(2)}>Continuar</Button>
        </div>
      )}

      {/* Step 2: Guest data */}
      {step === 2 && (
        <div className="bg-white rounded-lg shadow p-6">
          <GuestForm onSubmit={handleGuestSubmit} onBack={() => setStep(1)} />
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div className="bg-white rounded-lg shadow p-6">
          {loading && <Loading className="py-8" />}
          {!loading && result && (
            <ConfirmationView
              success={result.success}
              reservationId={result.reservationId}
              roomType={roomType}
              checkIn={checkIn}
              checkOut={checkOut}
              guestName={guestData?.name}
              errorMessage={result.error}
              onNewReservation={handleNewReservation}
            />
          )}
          {!loading && !result && (
            <Alert variant="info">Procesando reservación...</Alert>
          )}
        </div>
      )}
    </div>
  );
}
