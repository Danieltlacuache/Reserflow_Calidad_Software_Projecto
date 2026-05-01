// src/modules/integrations/integration.types.ts — Tipos e interfaces de integración

export interface ExternalAvailability {
  platform: 'airbnb' | 'booking';
  roomType: string;
  available: boolean;
  price: number;
  currency: string;
}

export interface IntegrationConfig {
  baseUrl: string;
  timeoutMs: number;
}

export interface IMockIntegrationClient {
  /** Consulta disponibilidad en Airbnb mock */
  getAirbnbAvailability(
    roomType: string,
    checkIn: Date,
    checkOut: Date,
  ): Promise<ExternalAvailability[]>;

  /** Consulta disponibilidad en Booking.com mock */
  getBookingAvailability(
    roomType: string,
    checkIn: Date,
    checkOut: Date,
  ): Promise<ExternalAvailability[]>;
}
