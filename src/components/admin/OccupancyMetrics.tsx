'use client';

import React from 'react';

interface OccupancyItem {
  roomType: string;
  date: string;
  availableCount: number;
}

interface OccupancyMetricsProps {
  data: OccupancyItem[];
}

const totalByType: Record<string, number> = {
  single: 10,
  double: 8,
  suite: 4,
  deluxe: 2,
};

const roomLabels: Record<string, string> = {
  single: 'Single',
  double: 'Double',
  suite: 'Suite',
  deluxe: 'Deluxe',
};

export default function OccupancyMetrics({ data }: OccupancyMetricsProps) {
  // Aggregate average availability per room type
  const grouped: Record<string, number[]> = {};
  for (const item of data) {
    if (!grouped[item.roomType]) grouped[item.roomType] = [];
    grouped[item.roomType].push(item.availableCount);
  }

  const metrics = Object.entries(grouped).map(([type, counts]) => {
    const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
    const total = totalByType[type] || 1;
    const occupancyPct = Math.round(((total - avg) / total) * 100);
    return { type, avgAvailable: Math.round(avg), total, occupancyPct };
  });

  if (metrics.length === 0) {
    return <p className="text-sm text-gray-500">Sin datos de ocupación disponibles.</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Ocupación (próximos 7 días)</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {metrics.map((m) => (
          <div key={m.type} className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-700">{roomLabels[m.type] || m.type}</p>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{m.occupancyPct}% ocupado</span>
                <span>{m.avgAvailable}/{m.total} disponibles (prom.)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    m.occupancyPct > 80 ? 'bg-red-500' : m.occupancyPct > 50 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(m.occupancyPct, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
