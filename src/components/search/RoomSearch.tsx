'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Loading from '@/components/ui/Loading';
import RoomCard from './RoomCard';

interface RoomResult {
  roomType: string;
  date: string;
  availableCount: number;
}

interface AggregatedRoom {
  roomType: string;
  minAvailable: number;
  pricePerNight: number;
}

const roomPrices: Record<string, number> = {
  single: 800,
  double: 1200,
  suite: 2500,
  deluxe: 4000,
};

interface RoomSearchProps {
  onSelectRoom?: (roomType: string, checkIn: string, checkOut: string) => void;
}

export default function RoomSearch({ onSelectRoom }: RoomSearchProps) {
  const today = new Date().toISOString().split('T')[0];
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [roomType, setRoomType] = useState('');
  const [results, setResults] = useState<AggregatedRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResults([]);

    if (!checkIn || !checkOut) {
      setError('Por favor selecciona fechas de check-in y check-out.');
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      setError('La fecha de check-out debe ser posterior al check-in.');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({
        checkIn: new Date(checkIn).toISOString(),
        checkOut: new Date(checkOut).toISOString(),
      });
      if (roomType) params.set('roomType', roomType);

      const res = await fetch(`/api/rooms/availability?${params.toString()}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json.error?.message || 'Error al buscar disponibilidad.');
        return;
      }

      const data: RoomResult[] = json.data || [];
      // Aggregate: for each room type, find the minimum availability across dates
      const grouped: Record<string, number[]> = {};
      for (const item of data) {
        if (!grouped[item.roomType]) grouped[item.roomType] = [];
        grouped[item.roomType].push(item.availableCount);
      }

      const aggregated: AggregatedRoom[] = Object.entries(grouped).map(([type, counts]) => ({
        roomType: type,
        minAvailable: Math.min(...counts),
        pricePerNight: roomPrices[type] || 0,
      }));

      setResults(aggregated);
    } catch {
      setError('No se pudo conectar con el servidor. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSearch} className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Buscar habitaciones</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            label="Check-in"
            type="date"
            value={checkIn}
            min={today}
            onChange={(e) => setCheckIn(e.target.value)}
          />
          <Input
            label="Check-out"
            type="date"
            value={checkOut}
            min={checkIn || today}
            onChange={(e) => setCheckOut(e.target.value)}
          />
          <div className="w-full">
            <label htmlFor="roomType" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de habitación
            </label>
            <select
              id="roomType"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas</option>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="suite">Suite</option>
              <option value="deluxe">Deluxe</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button type="submit" loading={loading} className="w-full">
              Buscar
            </Button>
          </div>
        </div>
      </form>

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}
      {loading && <Loading className="py-8" />}

      {!loading && searched && results.length === 0 && !error && (
        <Alert variant="info">No se encontraron habitaciones disponibles para las fechas seleccionadas.</Alert>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-4">
          {results.map((room) => (
            <RoomCard
              key={room.roomType}
              roomType={room.roomType}
              availableCount={room.minAvailable}
              pricePerNight={room.pricePerNight}
              onSelect={() => onSelectRoom?.(room.roomType, checkIn, checkOut)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
