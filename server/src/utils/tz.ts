import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { AppError } from './AppError.js';

dayjs.extend(utc);
dayjs.extend(timezone);

export function isValidTimeZone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export function zonedToUTC(dateTimeString: string, tz: string): Date {
  const parsed = dayjs.tz(dateTimeString, tz);
  if (!parsed.isValid()) {
    throw new AppError('invalid date/time value', 400);
  }
  return parsed.utc().toDate();
}

export function formatInZone(date: Date, tz: string, fmt = 'YYYY-MM-DD HH:mm'): string {
  return dayjs(date).tz(tz).format(fmt);
}

export { dayjs };
