'use client';

import React from 'react';
import Button from '@/components/ui/Button';

interface RoomCardProps {
  roomType: string;
  availableCount: number;
  pricePerNight: number;
  onSelect: () => void;
}

const roomLabels: Record<string, string> = {
  single: 'Single',
  double: 'Double',
  suite: 'Suite',
  deluxe: 'Deluxe',
};

const roomCapacity: Record<string, number> = {
  single: 1,
  double: 2,
  suite: 3,
  deluxe: 4,
};

export default function RoomCard({ roomType, availableCount, pricePerNight, onSelect }: RoomCardProps) {
  const available = availableCount > 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{roomLabels[roomType] || roomType}</h3>
          <p className="text-sm text-gray-500">Capacidad: {roomCapacity[roomType] || '—'} huésped(es)</p>
          <p className="text-sm text-gray-500">
            Disponibles: <span className={available ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>{availableCount}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900">${pricePerNight.toLocaleString()}</p>
          <p className="text-xs text-gray-500">por noche</p>
          <Button size="sm" className="mt-2" disabled={!available} onClick={onSelect}>
            {available ? 'Reservar' : 'Sin disponibilidad'}
          </Button>
        </div>
      </div>
    </div>
  );
}
