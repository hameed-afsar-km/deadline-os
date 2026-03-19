import { DeadlineEvent, Priority } from '@/types';
import { Timestamp } from 'firebase/firestore';

export function computePriority(deadline: Timestamp | string): Priority {
  const deadlineDate =
    deadline instanceof Timestamp ? deadline.toDate() : new Date(deadline);
  const now = new Date();
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) return 'high';
  if (diffHours < 72) return 'medium';
  return 'low';
}

export function getEffectivePriority(event: DeadlineEvent): Priority {
  if (event.priority !== 'auto') return event.priority;
  return computePriority(event.deadline);
}

export function isOverdue(event: DeadlineEvent): boolean {
  const deadlineDate =
    event.deadline instanceof Timestamp
      ? event.deadline.toDate()
      : new Date(event.deadline);
  return deadlineDate < new Date() && event.status !== 'completed';
}

export function isToday(event: DeadlineEvent): boolean {
  const deadlineDate =
    event.deadline instanceof Timestamp
      ? event.deadline.toDate()
      : new Date(event.deadline);
  const now = new Date();
  return (
    deadlineDate.getFullYear() === now.getFullYear() &&
    deadlineDate.getMonth() === now.getMonth() &&
    deadlineDate.getDate() === now.getDate()
  );
}

export function defaultReminders(deadline: string): string[] {
  const d = new Date(deadline);
  const onDay = new Date(d);
  onDay.setHours(8, 0, 0, 0);

  const dayBefore = new Date(d);
  dayBefore.setDate(d.getDate() - 1);
  dayBefore.setHours(8, 0, 0, 0);

  return [dayBefore.toISOString(), onDay.toISOString()];
}
