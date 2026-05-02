'use client';

import React, { useState, useEffect } from 'react';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';

interface Reservation {
  id: string;
  roomType: string;
  status: string;
  checkIn: string;
  checkOut: string;
  guestId: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  Pendiente: 'bg-yellow-100 text-yellow-800',
  Confirmada: 'bg-green-100 text-green-800',
  Cancelada: 'bg-red-100 text-red-800',
  Completada: 'bg-blue-100 text-blue-800',
};

export default function ReservationTable() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchReservations = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/reservations?${params.toString()}`);
      const json = await res.json();
      if (res.ok) {
        setReservations(json.data || []);
      } else {
        setError(json.error?.message || 'Error al cargar reservaciones.');
      }
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900">Reservaciones</h3>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Confirmada">Confirmada</option>
          <option value="Cancelada">Cancelada</option>
          <option value="Completada">Completada</option>
        </select>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {loading && <Loading className="py-6" />}

      {!loading && !error && reservations.length === 0 && (
        <Alert variant="info">No se encontraron reservaciones.</Alert>
      )}

      {!loading && reservations.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-out</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reservations.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-gray-700">{r.id.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-sm text-gray-700 capitalize">{r.roomType}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{new Date(r.checkIn).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{new Date(r.checkOut).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status] || 'bg-gray-100 text-gray-800'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
