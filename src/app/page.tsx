'use client';

import { useRouter } from 'next/navigation';
import RoomSearch from '@/components/search/RoomSearch';

export default function Home() {
  const router = useRouter();

  const handleSelectRoom = (roomType: string, checkIn: string, checkOut: string) => {
    const params = new URLSearchParams({ roomType, checkIn, checkOut });
    router.push(`/reservations?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">ReservFlow</h1>
        <p className="text-lg text-gray-600 mt-2">Sistema de gestión de reservaciones de hotel</p>
      </header>
      <main>
        <RoomSearch onSelectRoom={handleSelectRoom} />
      </main>
    </div>
  );
}
