import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'ReservFlow',
  description: 'Sistema de gestión de reservaciones de hotel',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <nav className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
            <Link href="/" className="text-lg font-bold text-blue-600">
              ReservFlow
            </Link>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                Inicio
              </Link>
              <Link href="/reservations" className="text-gray-600 hover:text-gray-900 transition-colors">
                Reservaciones
              </Link>
              <Link href="/admin/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                Admin Dashboard
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
