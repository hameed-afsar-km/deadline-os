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

export function getPriorityColor(event: DeadlineEvent): string {
  const p = getEffectivePriority(event);
  if (p === 'high') return '#F43F5E';
  if (p === 'medium') return '#F97316';
  if (p === 'low') return '#10B981';
  return '#8B5CF6';
}

export function getTimeRemaining(deadline: Timestamp | string): string {
  const d = deadline instanceof Timestamp ? deadline.toDate() : new Date(deadline);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  
  if (diffMs < 0) return 'OVERDUE';
  
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}D ${diffHours % 24}H`;
  if (diffHours > 0) return `${diffHours}H ${diffMins % 60}M`;
  if (diffMins > 0) return `${diffMins}M ${diffSecs % 60}S`;
  return `${diffSecs}S`;
}

export function getDetailedCountdown(deadline: Timestamp | string) {
  const d = deadline instanceof Timestamp ? deadline.toDate() : new Date(deadline);
  const now = new Date();
  const ms = d.getTime() - now.getTime();
  
  if (ms < 0) return { days: 0, hours: 0, mins: 0, secs: 0, overdue: true };
  
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const days = Math.floor(h / 24);

  return {
    days,
    hours: h % 24,
    mins: m % 60,
    secs: s % 60,
    overdue: false
  };
}
