'use client';

import { DeadlineEvent } from '@/types';
import { getEffectivePriority, isOverdue } from '@/utils/priority';
import { formatCountdown, formatDeadline } from '@/utils/dateHelpers';
import { updateEvent, deleteEvent } from '@/lib/firestore';
import { CheckCircle2, Clock, Pencil, Trash2, AlertTriangle, Zap, Calendar } from 'lucide-react';
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';
import { Timestamp } from 'firebase/firestore';

const CATEGORY_CONFIG = {
  Study:      { color: '#6366f1', bg: 'rgba(99,102,241,0.12)',   gradient: 'linear-gradient(135deg,#4f46e5,#6366f1)', emoji: '📚' },
  Hackathon:  { color: '#a855f7', bg: 'rgba(168,85,247,0.12)',  gradient: 'linear-gradient(135deg,#7c3aed,#a855f7)', emoji: '⚡' },
  Submission: { color: '#f43f5e', bg: 'rgba(244,63,94,0.12)',   gradient: 'linear-gradient(135deg,#e11d48,#f43f5e)', emoji: '📨' },
  Personal:   { color: '#10b981', bg: 'rgba(16,185,129,0.12)',  gradient: 'linear-gradient(135deg,#059669,#10b981)', emoji: '🌱' },
  Exam:       { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  gradient: 'linear-gradient(135deg,#d97706,#f59e0b)', emoji: '✏️' },
};

const PRIORITY_CONFIG = {
  high:   { color: '#f43f5e', label: 'High',   bg: 'rgba(244,63,94,0.15)',   ring: 'rgba(244,63,94,0.35)'   },
  medium: { color: '#f59e0b', label: 'Medium', bg: 'rgba(245,158,11,0.15)', ring: 'rgba(245,158,11,0.35)' },
  low:    { color: '#10b981', label: 'Low',    bg: 'rgba(16,185,129,0.15)', ring: 'rgba(16,185,129,0.35)' },
  auto:   { color: '#6366f1', label: 'Auto',   bg: 'rgba(99,102,241,0.15)', ring: 'rgba(99,102,241,0.35)' },
};

function getTimeProgress(deadline: unknown): number {
  try {
    const end = deadline instanceof Timestamp ? deadline.toDate() : new Date(deadline as string);
    const now = new Date();
    const created = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000); // assume 7 day window
    const total = end.getTime() - created.getTime();
    const elapsed = now.getTime() - created.getTime();
    const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
    return pct;
  } catch { return 0; }
}

interface EventCardProps {
  event: DeadlineEvent;
  onEdit: (event: DeadlineEvent) => void;
  style?: React.CSSProperties;
}

export function EventCard({ event, onEdit, style }: EventCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const effectivePriority = getEffectivePriority(event);
  const overdue = isOverdue(event);
  const catConfig = CATEGORY_CONFIG[event.category] ?? CATEGORY_CONFIG.Personal;
  const priorityConfig = PRIORITY_CONFIG[effectivePriority] ?? PRIORITY_CONFIG.low;
  const completed = event.status === 'completed';
  const progress = getTimeProgress(event.deadline);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
    const y = -((e.clientX - rect.left) / rect.width - 0.5) * 8;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setHovered(false);
  };

  const handleToggleComplete = async () => {
    setToggling(true);
    try {
      await updateEvent(event.id, { status: completed ? 'pending' : 'completed' });
      toast.success(completed ? 'Marked as pending' : 'Completed! 🎉');
    } catch {
      toast.error('Failed to update');
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this deadline? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await deleteEvent(event.id);
      toast.success('Deadline deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={cn('group relative rounded-2xl overflow-hidden cursor-default', completed && 'opacity-60')}
      style={{
        background: 'var(--bg-elevated)',
        border: overdue && !completed
          ? '1px solid rgba(244,63,94,0.35)'
          : hovered ? '1px solid var(--border-mid)' : '1px solid var(--border-dim)',
        boxShadow: hovered
          ? overdue && !completed
            ? '0 16px 48px rgba(244,63,94,0.15), 0 0 0 1px rgba(244,63,94,0.2)'
            : '0 16px 48px rgba(0,0,0,0.4), 0 0 30px rgba(124,58,237,0.05)'
          : 'none',
        transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${hovered ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)'}`,
        transition: hovered
          ? 'transform 0.1s ease, box-shadow 0.3s ease, border-color 0.2s ease'
          : 'transform 0.4s cubic-bezier(.22,.68,0,1.2), box-shadow 0.3s ease, border-color 0.2s ease',
        ...style,
      }}
    >
      {/* Priority stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{
          background: overdue && !completed ? '#f43f5e' : priorityConfig.color,
          boxShadow: `0 0 8px ${overdue && !completed ? 'rgba(244,63,94,0.5)' : priorityConfig.ring}`,
        }}
      />

      {/* Card inner */}
      <div className="pl-4 pr-4 pt-4 pb-3">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category badge */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ background: catConfig.bg, color: catConfig.color }}>
              <span>{catConfig.emoji}</span>
              {event.category}
            </span>

            {/* Priority badge */}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{ background: priorityConfig.bg, color: priorityConfig.color }}>
              {priorityConfig.label}
            </span>

            {/* Overdue */}
            {overdue && !completed && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse"
                style={{ background: 'rgba(244,63,94,0.15)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.3)' }}>
                <AlertTriangle size={9} /> OVERDUE
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
            <button
              onClick={() => onEdit(event)}
              className="p-1.5 rounded-lg transition-all duration-150 hover:bg-indigo-500/15 hover:scale-110 active:scale-90"
              aria-label="Edit event"
            >
              <Pencil size={13} style={{ color: '#818cf8' }} />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 rounded-lg transition-all duration-150 hover:bg-rose-500/15 hover:scale-110 active:scale-90"
              aria-label="Delete event"
            >
              <Trash2 size={13} style={{ color: deleting ? 'var(--text-faint)' : '#f43f5e' }} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3
          className={cn('font-bold text-base mb-1 leading-snug', completed && 'line-through')}
          style={{ color: 'var(--text-white)' }}
        >
          {event.title}
        </h3>

        {/* Description */}
        {event.description && (
          <p className="text-xs mb-3 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-mid)' }}>
            {event.description}
          </p>
        )}

        {/* Time progress bar */}
        {!completed && (
          <div className="mb-3">
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${progress}%`,
                  background: overdue
                    ? 'linear-gradient(90deg, #f43f5e, #fb7185)'
                    : progress > 80
                    ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                    : 'linear-gradient(90deg, #4f46e5, #a855f7)',
                }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-dim)' }}>
            <span className="flex items-center gap-1">
              <Calendar size={10} />
              {formatDeadline(event.deadline)}
            </span>
            <span
              className="flex items-center gap-1 font-semibold"
              style={{ color: overdue && !completed ? '#f43f5e' : '#a78bfa' }}
            >
              <Clock size={10} />
              {formatCountdown(event.deadline)}
            </span>
          </div>

          {/* Complete toggle */}
          <button
            onClick={handleToggleComplete}
            disabled={toggling}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-90 disabled:opacity-40"
            style={{
              background: completed ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.12)',
              color: completed ? '#10b981' : '#a5b4fc',
              border: `1px solid ${completed ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.25)'}`,
            }}
          >
            {toggling ? (
              <Zap size={11} className="animate-spin" />
            ) : (
              <CheckCircle2 size={11} />
            )}
            {completed ? 'Done' : 'Complete'}
          </button>
        </div>
      </div>

      {/* Hover gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${catConfig.color}08, transparent 70%)`,
          opacity: hovered ? 1 : 0,
        }}
      />
    </div>
  );
}
