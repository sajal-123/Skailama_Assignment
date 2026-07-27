import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export function formatInZone(isoOrDate, tz, fmt = 'MMM D, YYYY h:mm A') {
  if (!isoOrDate) return '';
  return dayjs(isoOrDate).tz(tz).format(fmt);
}

export function nowInZone(tz) {
  return dayjs().tz(tz);
}

export default dayjs;
