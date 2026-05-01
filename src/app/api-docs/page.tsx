'use client';

import React from 'react';

const endpoints = [
  {
    method: 'POST',
    path: '/api/reservations',
    summary: 'Crear reservación',
    description: 'Crea una nueva reservación con estado inicial "Pendiente".',
    request: `{
  "roomId": "uuid",
  "checkIn": "2025-08-01T14:00:00.000Z",
  "checkOut": "2025-08-05T11:00:00.000Z",
  "guestData": { "name": "Juan Pérez", "email": "juan@example.com", "phone": "+525512345678" },
  "roomType": "double"
}`,
    responses: [
      { code: 201, description: 'Reservación creada' },
      { code: 400, description: 'Datos de entrada inválidos' },
      { code: 500, description: 'Error interno del servidor' },
    ],
  },
  {
    method: 'GET', path: '/api/reservations', summary: 'Listar reservaciones',
    description: 'Obtiene reservaciones con filtros opcionales: status, dateFrom, dateTo, roomId.',
    request: null,
    responses: [{ code: 200, description: 'Lista de reservaciones' }, { code: 400, description: 'Parámetros inválidos' }],
  },
  {
    method: 'GET', path: '/api/reservations/{id}', summary: 'Obtener por ID',
    description: 'Retorna los detalles de una reservación específica.',
    request: null,
    responses: [{ code: 200, description: 'Reservación encontrada' }, { code: 404, description: 'No encontrada' }],
  },
  {
    method: 'PATCH', path: '/api/reservations/{id}', summary: 'Actualizar estado',
    description: 'Actualiza el estado: Pendiente → Confirmada → Completada/Cancelada.',
    request: '{ "status": "Confirmada" }',
    responses: [{ code: 200, description: 'Estado actualizado' }, { code: 422, description: 'Transición no permitida' }],
  },
  {
    method: 'DELETE', path: '/api/reservations/{id}', summary: 'Cancelar reservación',
    description: 'Cancela una reservación. Si estaba confirmada, libera el inventario.',
    request: null,
    responses: [{ code: 200, description: 'Cancelada' }, { code: 404, description: 'No encontrada' }],
  },
  {
    method: 'GET', path: '/api/rooms/availability', summary: 'Consultar disponibilidad',
    description: 'Consulta disponibilidad por tipo y rango de fechas. Params: roomType, checkIn, checkOut.',
    request: null,
    responses: [{ code: 200, description: 'Disponibilidad consultada' }, { code: 400, description: 'Parámetros inválidos' }],
  },
  {
    method: 'GET', path: '/api/admin/dashboard', summary: 'Dashboard administrativo',
    description: 'Métricas de reservaciones y ocupación para los próximos 7 días.',
    request: null,
    responses: [{ code: 200, description: 'Datos del dashboard' }],
  },
];

const methodColors: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-800', POST: 'bg-green-100 text-green-800',
  PATCH: 'bg-yellow-100 text-yellow-800', DELETE: 'bg-red-100 text-red-800',
};

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ReservFlow API</h1>
        <p className="text-gray-600 mb-8">OpenAPI 3.0 — Especificación completa en <code className="bg-gray-200 px-1 rounded text-xs">docs/openapi.yaml</code></p>
        <div className="space-y-4">
          {endpoints.map((ep, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${methodColors[ep.method]}`}>{ep.method}</span>
                <code className="text-sm font-mono text-gray-800">{ep.path}</code>
                <span className="ml-auto text-sm text-gray-500">{ep.summary}</span>
              </div>
              <div className="px-5 py-3 space-y-2">
                <p className="text-sm text-gray-700">{ep.description}</p>
                {ep.request && <pre className="bg-gray-50 border rounded p-2 text-xs overflow-x-auto">{ep.request}</pre>}
                <div className="flex flex-wrap gap-2">
                  {ep.responses.map((r) => (
                    <span key={r.code} className="text-xs font-mono text-gray-600">{r.code} — {r.description}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
