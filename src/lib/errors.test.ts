// src/lib/errors.test.ts

import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  NotFoundError,
  AvailabilityError,
  InvalidTransitionError,
  IntegrationTimeoutError,
} from '@/lib/errors';

describe('AppError', () => {
  it('stores code, message, and statusCode', () => {
    const err = new AppError('SOME_CODE', 'something went wrong', 500);
    expect(err.code).toBe('SOME_CODE');
    expect(err.message).toBe('something went wrong');
    expect(err.statusCode).toBe(500);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
    expect(err.name).toBe('AppError');
  });

  it('defaults statusCode to 500', () => {
    const err = new AppError('CODE', 'msg');
    expect(err.statusCode).toBe(500);
  });
});

describe('ValidationError', () => {
  it('has statusCode 400 and stores details', () => {
    const details = [
      { field: 'email', message: 'invalid email' },
      { field: 'name', message: 'required' },
    ];
    const err = new ValidationError('Validation failed', details);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.message).toBe('Validation failed');
    expect(err.details).toEqual(details);
    expect(err).toBeInstanceOf(AppError);
  });
});

describe('NotFoundError', () => {
  it('has statusCode 404 and formatted message', () => {
    const err = new NotFoundError('Reservación', 'abc-123');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('Reservación con id abc-123 no encontrado');
    expect(err).toBeInstanceOf(AppError);
  });
});

describe('AvailabilityError', () => {
  it('has statusCode 409', () => {
    const err = new AvailabilityError('No rooms available');
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('NO_AVAILABILITY');
    expect(err.message).toBe('No rooms available');
    expect(err).toBeInstanceOf(AppError);
  });
});

describe('InvalidTransitionError', () => {
  it('has statusCode 422 and formatted message', () => {
    const err = new InvalidTransitionError('Cancelada', 'Confirmada');
    expect(err.statusCode).toBe(422);
    expect(err.code).toBe('INVALID_TRANSITION');
    expect(err.message).toBe('Transición no permitida: Cancelada → Confirmada');
    expect(err).toBeInstanceOf(AppError);
  });
});

describe('IntegrationTimeoutError', () => {
  it('has statusCode 504', () => {
    const err = new IntegrationTimeoutError('airbnb');
    expect(err.statusCode).toBe(504);
    expect(err.code).toBe('INTEGRATION_TIMEOUT');
    expect(err.message).toBe('Timeout en integración con airbnb');
    expect(err).toBeInstanceOf(AppError);
  });
});
