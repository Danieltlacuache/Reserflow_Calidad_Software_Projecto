'use client';

import Dashboard from '@/components/admin/Dashboard';

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Panel Administrativo</h1>
        <p className="text-gray-600 mt-1">Gestión de reservaciones y métricas de ocupación</p>
      </header>
      <main className="max-w-5xl mx-auto">
        <Dashboard />
      </main>
    </div>
  );
}
