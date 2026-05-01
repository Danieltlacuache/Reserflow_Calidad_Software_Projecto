// src/lib/errors.ts — Clases de error personalizadas

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly details: Array<{ field: string; message: string }>,
  ) {
    super('VALIDATION_ERROR', message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super('NOT_FOUND', `${resource} con id ${id} no encontrado`, 404);
  }
}

export class AvailabilityError extends AppError {
  constructor(message: string) {
    super('NO_AVAILABILITY', message, 409);
  }
}

export class InvalidTransitionError extends AppError {
  constructor(from: string, to: string) {
    super('INVALID_TRANSITION', `Transición no permitida: ${from} → ${to}`, 422);
  }
}

export class IntegrationTimeoutError extends AppError {
  constructor(service: string) {
    super('INTEGRATION_TIMEOUT', `Timeout en integración con ${service}`, 504);
  }
}
