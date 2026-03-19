import { Timestamp } from 'firebase/firestore';
import { format, formatDistanceToNow, isPast, isToday as dfnsIsToday } from 'date-fns';

export function toDate(value: Timestamp | string | null | undefined): Date {
  if (!value) return new Date();
  if (value instanceof Timestamp) return value.toDate();
  return new Date(value);
}

export function formatDeadline(value: Timestamp | string): string {
  return format(toDate(value), 'PPp');
}

export function formatCountdown(value: Timestamp | string): string {
  const date = toDate(value);
  if (isPast(date)) return 'Overdue';
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatDateLabel(value: Timestamp | string): string {
  const date = toDate(value);
  if (dfnsIsToday(date)) return 'Today';
  return format(date, 'MMM d, yyyy');
}

export function toInputDatetimeLocal(value: Timestamp | string): string {
  const d = toDate(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
