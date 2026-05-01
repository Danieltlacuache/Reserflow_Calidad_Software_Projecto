'use client';

import React, { useState, useEffect } from 'react';
import Alert from '@/components/ui/Alert';
import Loading from '@/components/ui/Loading';
import ReservationTable from './ReservationTable';
import OccupancyMetrics from './OccupancyMetrics';

interface DashboardData {
  reservations: {
    activeCount: number;
    completedCount: number;
    cancelledCount: number;
  };
  occupancy: Array<{ roomType: string; date: string; availableCount: number }>;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/dashboard');
      const json = await res.json();
      if (res.ok) {
        setData(json.data);
      } else {
        setError(json.error?.message || 'Error al cargar el dashboard.');
      }
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {error && <Alert variant="error">{error}</Alert>}
      {loading && <Loading className="py-8" />}

      {!loading && data && (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-5 text-center">
              <p className="text-3xl font-bold text-green-600">{data.reservations.activeCount}</p>
              <p className="text-sm text-gray-500 mt-1">Confirmadas</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-5 text-center">
              <p className="text-3xl font-bold text-blue-600">{data.reservations.completedCount}</p>
              <p className="text-sm text-gray-500 mt-1">Completadas</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-5 text-center">
              <p className="text-3xl font-bold text-red-600">{data.reservations.cancelledCount}</p>
              <p className="text-sm text-gray-500 mt-1">Canceladas</p>
            </div>
          </div>

          {/* Occupancy metrics */}
          <OccupancyMetrics data={data.occupancy} />
        </>
      )}

      {/* Reservation table (fetches its own data) */}
      <ReservationTable />
    </div>
  );
}
