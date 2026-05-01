// src/modules/inventory/inventory.schema.ts

import { z } from 'zod';

export const AvailabilityQuerySchema = z.object({
  roomType: z.enum(['single', 'double', 'suite', 'deluxe']).optional(),
  checkIn: z.string().datetime(),
  checkOut: z.string().datetime(),
});
