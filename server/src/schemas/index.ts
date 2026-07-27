import { z } from 'zod';
import { isValidTimeZone } from '../utils/tz.js';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'invalid id');

const timezone = z.string().refine(isValidTimeZone, 'invalid or unknown timezone');

const wallClock = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/, 'expected YYYY-MM-DDTHH:mm');

export const eventBodySchema = z.object({
  profiles: z.array(objectId).min(1, 'at least one profile must be selected'),
  timezone,
  startAt: wallClock,
  endAt: wallClock,
});

export const listEventsQuerySchema = z.object({
  profileId: objectId.optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

export const eventIdParamsSchema = z.object({ id: objectId });

export const createProfileSchema = z.object({
  name: z.string().trim().min(1, 'name is required').max(120),
  timezone: timezone.optional().default('UTC'),
});

export const updateProfileTimezoneSchema = z.object({ timezone });

export const profileIdParamsSchema = z.object({ id: objectId });

export type EventBody = z.infer<typeof eventBodySchema>;
export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;
export type CreateProfileBody = z.infer<typeof createProfileSchema>;
