import { Types } from 'mongoose';
import Event, { type IEvent } from '../models/Event.js';
import Profile from '../models/Profile.js';
import { zonedToUTC } from '../utils/tz.js';
import { AppError } from '../utils/AppError.js';
import type { EventBody, ListEventsQuery } from '../schemas/index.js';
import type { UpdateLog } from '../types/index.js';

// Normalized, storage-ready shape of an event's mutable fields.
interface NormalizedEvent {
  profiles: Types.ObjectId[];
  timezone: string;
  startAt: Date;
  endAt: Date;
}

// Convert the validated request body into UTC-normalized values and enforce
// business rules (valid ordering, referenced profiles must exist).
async function normalize(body: EventBody): Promise<NormalizedEvent> {
  const startAt = zonedToUTC(body.startAt, body.timezone);
  const endAt = zonedToUTC(body.endAt, body.timezone);

  if (endAt.getTime() < startAt.getTime()) {
    throw new AppError('end date/time cannot be before start date/time', 400);
  }

  const profileIds = body.profiles.map((id) => new Types.ObjectId(id));
  const existingCount = await Profile.countDocuments({ _id: { $in: profileIds } });
  if (existingCount !== new Set(body.profiles).size) {
    throw new AppError('one or more selected profiles do not exist', 400);
  }

  return { profiles: profileIds, timezone: body.timezone, startAt, endAt };
}

// Declarative diff table. To make a new field appear in the update history,
// add one entry here — no branching logic elsewhere needs to change.
type DiffableField = UpdateLog['field'];
const DIFF_FIELDS: {
  field: DiffableField;
  changed: (prev: IEvent, next: NormalizedEvent) => boolean;
  prev: (prev: IEvent) => string;
  next: (next: NormalizedEvent) => string;
}[] = [
  {
    field: 'profiles',
    // Set-based symmetric diff: O(n + m) instead of an O(n * m) nested-loop compare.
    changed: (prev, next) => {
      if (prev.profiles.length !== next.profiles.length) return true;
      const prevSet = new Set(prev.profiles.map((id) => id.toString()));
      return next.profiles.some((id) => !prevSet.has(id.toString()));
    },
    prev: (prev) => prev.profiles.map((p) => p.toString()).sort().join(','),
    next: (next) => next.profiles.map((p) => p.toString()).sort().join(','),
  },
  {
    field: 'timezone',
    changed: (prev, next) => prev.timezone !== next.timezone,
    prev: (prev) => prev.timezone,
    next: (next) => next.timezone,
  },
  {
    field: 'startAt',
    changed: (prev, next) => prev.startAt.getTime() !== next.startAt.getTime(),
    prev: (prev) => prev.startAt.toISOString(),
    next: (next) => next.startAt.toISOString(),
  },
  {
    field: 'endAt',
    changed: (prev, next) => prev.endAt.getTime() !== next.endAt.getTime(),
    prev: (prev) => prev.endAt.toISOString(),
    next: (next) => next.endAt.toISOString(),
  },
];

function buildLogs(prev: IEvent, next: NormalizedEvent): UpdateLog[] {
  const changedAt = new Date();
  return DIFF_FIELDS.filter((f) => f.changed(prev, next)).map((f) => ({
    field: f.field,
    previousValue: f.prev(prev),
    newValue: f.next(next),
    changedAt,
  }));
}

export async function listEvents(query: ListEventsQuery) {
  const { profileId, page, limit } = query;
  const filter = profileId ? { profiles: profileId } : {};
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Event.find(filter).populate('profiles').sort({ startAt: 1 }).skip(skip).limit(limit),
    Event.countDocuments(filter),
  ]);

  return { items, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export async function createEvent(body: EventBody) {
  const data = await normalize(body);
  const event = await Event.create(data);
  return event.populate('profiles');
}

export async function updateEvent(id: string, body: EventBody) {
  const existing = await Event.findById(id);
  if (!existing) throw new AppError('event not found', 404);

  const data = await normalize(body);
  const logs = buildLogs(existing, data);

  existing.set(data);
  if (logs.length) existing.updateLogs.push(...logs);

  await existing.save();
  return existing.populate('profiles');
}

export async function getEventLogs(id: string) {
  const event = await Event.findById(id).select('updateLogs');
  if (!event) throw new AppError('event not found', 404);
  return event.updateLogs;
}
