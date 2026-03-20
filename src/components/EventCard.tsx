'use client';

import { DeadlineEvent } from '@/types';
import { getEffectivePriority, isOverdue } from '@/utils/priority';
import { updateEvent, deleteEvent } from '@/lib/firestore';
import { CheckCircle2, Clock, Pencil, Trash2, Loader2, AlertTriangle, Calendar } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Timestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';

const PRIORITY_CFG: Record<string, { color: string; label: string; bg: string; border: string }> = {
  high:   { color: '#F59E0B', label: 'HIGH URGENCY', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)' },
  medium: { color: '#67E8F9', label: 'MEDIUM',       bg: 'rgba(103,232,249,0.08)', border: 'rgba(103,232,249,0.2)' },
  low:    { color: '#34D399', label: 'LOW',          bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.2)' },
  auto:   { color: '#C4B5FD', label: 'AUTO',         bg: 'rgba(196,181,253,0.08)', border: 'rgba(196,181,253,0.2)' },
};

const CATEGORY_ICONS: Record<string, string> = {
  Study:      '📚',
  Hackathon:  '⚡',
  Submission: '📨',
  Personal:   '🌱',
  Exam:       '✏️',
};

function fmtCountdown(deadline: unknown): string {
  try {
    const end = deadline instanceof Timestamp ? deadline.toDate() : new Date(deadline as string);
    const ms  = end.getTime() - Date.now();
    if (ms <= 0) return 'Overdue';
    const h = Math.floor(ms / 3_600_000);
    const d = Math.floor(h / 24);
    return d > 0 ? `${d}d ${h % 24}h` : `${h}h`;
  } catch { return '--'; }
}

function fmtDate(deadline: unknown): string {
  try {
    const d = deadline instanceof Timestamp ? deadline.toDate() : new Date(deadline as string);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(d);
  } catch { return 'Invalid'; }
}

function getProgress(deadline: unknown): number {
  try {
    const end  = deadline instanceof Timestamp ? deadline.toDate() : new Date(deadline as string);
    const base = new Date(end.getTime() - 7 * 86_400_000);
    const total   = end.getTime() - base.getTime();
    const elapsed = Date.now() - base.getTime();
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  } catch { return 0; }
}

interface EventCardProps {
  event: DeadlineEvent;
  onEdit: (event: DeadlineEvent) => void;
}

export function EventCard({ event, onEdit }: EventCardProps) {
  const [loading, setLoading] = useState(false);

  const priority  = getEffectivePriority(event);
  const overdue   = isOverdue(event);
  const completed = event.status === 'completed';
  const pCfg      = PRIORITY_CFG[priority] ?? PRIORITY_CFG.auto;
  const cIcon     = CATEGORY_ICONS[event.category] ?? '📌';
  const progress  = getProgress(event.deadline);

  const toggle = async () => {
    setLoading(true);
    try { await updateEvent(event.id, { status: completed ? 'pending' : 'completed' }); }
    catch { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  const remove = async () => {
    if (!confirm('Are you sure you want to delete this deadline?')) return;
    setLoading(true);
    try { await deleteEvent(event.id); }
    catch { toast.error('Delete failed'); }
    finally { setLoading(false); }
  };

  const isHighAlert = overdue && !completed;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: completed ? 0.6 : 1, scale: 1, filter: completed ? 'grayscale(0.5)' : 'none' }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={completed ? {} : { y: -4, borderColor: isHighAlert ? 'rgba(251,113,133,0.4)' : 'var(--b2)' }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] as any }}
      className="card p-5 flex flex-col gap-4 relative group"
      style={{
        borderColor: isHighAlert ? 'rgba(251,113,133,0.3)' : completed ? 'var(--b1)' : 'var(--b1)',
        boxShadow: isHighAlert ? '0 0 20px rgba(251,113,133,0.08)' : 'none',
        background: isHighAlert ? 'linear-gradient(180deg, rgba(251,113,133,0.04) 0%, transparent 100%), var(--s1)' : 'var(--s1)',
      }}
    >
      {/* Top indicator stripe for priority focus */}
      {!completed && (
        <div
          className="absolute top-0 left-6 right-6 h-[2px] rounded-b-full opacity-60"
          style={{ background: isHighAlert ? '#FB7185' : pCfg.color, boxShadow: `0 0 10px ${isHighAlert ? '#FB7185' : pCfg.color}` }}
        />
      )}

      {/* Header tags & Actions */}
      <div className="flex items-start justify-between">
        <div className="flex flex-wrap gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold"
            style={{ background: 'var(--s3)', color: 'var(--t2)' }}
          >
            <span className="opacity-80">{cIcon}</span> {event.category}
          </span>
          <span
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold tracking-wide"
            style={{ color: pCfg.color, background: pCfg.bg, border: `1px solid ${pCfg.border}` }}
          >
            {pCfg.label}
          </span>
          {isHighAlert && (
            <motion.span
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-extrabold tracking-wide"
              style={{ color: '#FB7185', background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)' }}
            >
              <AlertTriangle size={10} /> OVERDUE
            </motion.span>
          )}
        </div>

        {/* Action icons appear on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            whileHover={{ scale: 1.1, color: 'var(--t0)' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(event)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--t3)' }}
          >
            <Pencil size={14} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, color: 'var(--rose)' }}
            whileTap={{ scale: 0.9 }}
            onClick={remove}
            disabled={loading}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--t3)' }}
          >
            <Trash2 size={14} />
          </motion.button>
        </div>
      </div>

      {/* Title & Desc */}
      <div>
        <h3
          className={`text-base font-bold leading-snug line-clamp-2 ${completed ? 'line-through opacity-70' : ''}`}
          style={{ color: isHighAlert ? '#FB7185' : 'var(--t0)' }}
        >
          {event.title}
        </h3>
        {event.description && (
          <p className="text-sm font-medium line-clamp-2 mt-1.5 leading-relaxed" style={{ color: 'var(--t3)' }}>
            {event.description}
          </p>
        )}
      </div>

      {/* Progress Line */}
      {!completed && (
        <div className="h-1 rounded-full overflow-hidden mt-1" style={{ background: 'var(--s3)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              background: isHighAlert ? '#FB7185' : progress > 85 ? 'var(--amber)' : 'linear-gradient(90deg, #F59E0B, #FCD34D)',
            }}
          />
        </div>
      )}

      {/* Footer Details */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t" style={{ borderColor: 'var(--b1)' }}>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--t3)' }}>
            <Calendar size={12} /> {fmtDate(event.deadline)}
          </div>
          <div
            className="flex items-center gap-1.5 text-xs font-extrabold"
            style={{ color: isHighAlert ? '#FB7185' : 'var(--t0)' }}
          >
            <Clock size={12} /> {fmtCountdown(event.deadline)}
          </div>
        </div>

        <motion.button
          whileHover={completed ? {} : { scale: 1.05, boxShadow: '0 0 16px rgba(52,211,153,0.3)' }}
          whileTap={{ scale: 0.95 }}
          onClick={toggle}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
          style={
            completed
              ? { border: '1px solid var(--b1)', color: 'var(--t3)', background: 'transparent' }
              : { border: '1px solid rgba(52,211,153,0.3)', color: '#0C0A09', background: 'linear-gradient(135deg, #34D399, #059669)' }
          }
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
          {completed ? 'Reopen' : 'Complete'}
        </motion.button>
      </div>
    </motion.div>
  );
}
