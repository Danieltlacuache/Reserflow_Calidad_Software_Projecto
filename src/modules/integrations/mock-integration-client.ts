// src/modules/integrations/mock-integration-client.ts — Cliente HTTP para Mock APIs

import axios, { AxiosInstance } from 'axios';
import { AppError, IntegrationTimeoutError } from '@/lib/errors';
import {
  ExternalAvailability,
  IntegrationConfig,
  IMockIntegrationClient,
} from './integration.types';

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export class MockIntegrationClient implements IMockIntegrationClient {
  private readonly airbnbClient: AxiosInstance;
  private readonly bookingClient: AxiosInstance;

  constructor(
    airbnbConfig: IntegrationConfig,
    bookingConfig: IntegrationConfig,
  ) {
    this.airbnbClient = axios.create({
      baseURL: airbnbConfig.baseUrl,
      timeout: airbnbConfig.timeoutMs,
    });

    this.bookingClient = axios.create({
      baseURL: bookingConfig.baseUrl,
      timeout: bookingConfig.timeoutMs,
    });
  }

  async getAirbnbAvailability(
    roomType: string,
    checkIn: Date,
    checkOut: Date,
  ): Promise<ExternalAvailability[]> {
    return this.fetchAvailability(
      this.airbnbClient,
      'airbnb',
      roomType,
      checkIn,
      checkOut,
    );
  }

  async getBookingAvailability(
    roomType: string,
    checkIn: Date,
    checkOut: Date,
  ): Promise<ExternalAvailability[]> {
    return this.fetchAvailability(
      this.bookingClient,
      'booking',
      roomType,
      checkIn,
      checkOut,
    );
  }

  private async fetchAvailability(
    client: AxiosInstance,
    platform: 'airbnb' | 'booking',
    roomType: string,
    checkIn: Date,
    checkOut: Date,
  ): Promise<ExternalAvailability[]> {
    const url = '/availability';
    const method = 'GET';
    const startTime = Date.now();

    try {
      // Log request — only operational data, no sensitive info
      console.log(
        `[Integration] Request: ${method} ${platform} ${url} roomType=${roomType}`,
      );

      const response = await client.get(url, {
        params: {
          roomType,
          checkIn: formatDate(checkIn),
          checkOut: formatDate(checkOut),
        },
      });

      const duration = Date.now() - startTime;

      // Log response — only status and duration
      console.log(
        `[Integration] Response: ${platform} status=${response.status} duration=${duration}ms`,
      );

      return this.transformResponse(platform, response.data);
    } catch (error) {
      const duration = Date.now() - startTime;

      if (axios.isAxiosError(error)) {
        // Timeout
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          console.log(
            `[Integration] Timeout: ${platform} duration=${duration}ms`,
          );
          throw new IntegrationTimeoutError(platform);
        }

        const status = error.response?.status;
        console.log(
          `[Integration] Error: ${platform} status=${status} duration=${duration}ms`,
        );

        if (status === 400) {
          throw new AppError(
            'INTEGRATION_CLIENT_ERROR',
            `Error de cliente en integración con ${platform}: solicitud inválida`,
            400,
          );
        }

        if (status === 500) {
          throw new AppError(
            'INTEGRATION_SERVER_ERROR',
            `Error de servidor en integración con ${platform}: servicio no disponible`,
            502,
          );
        }
      }

      // Unknown error
      console.log(
        `[Integration] Unknown error: ${platform} duration=${duration}ms`,
      );
      throw new AppError(
        'INTEGRATION_ERROR',
        `Error inesperado en integración con ${platform}`,
        502,
      );
    }
  }

  private transformResponse(
    platform: 'airbnb' | 'booking',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[],
  ): ExternalAvailability[] {
    return data.map((item) => ({
      platform,
      roomType: String(item.roomType ?? item.room_type ?? ''),
      available: Boolean(item.available),
      price: Number(item.price ?? 0),
      currency: String(item.currency ?? 'USD'),
    }));
  }
}
