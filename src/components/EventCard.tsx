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
  high:   { color: 'var(--accent)',   label: 'HIGH',   bg: 'rgba(255,85,51,0.08)',   border: 'rgba(255,85,51,0.4)' },
  medium: { color: 'var(--amber)',    label: 'MEDIUM', bg: 'rgba(245,166,35,0.08)',  border: 'rgba(245,166,35,0.4)' },
  low:    { color: 'var(--accent-3)', label: 'LOW',    bg: 'rgba(0,200,150,0.08)',   border: 'rgba(0,200,150,0.4)' },
  auto:   { color: 'var(--accent-2)', label: 'AUTO',   bg: 'rgba(26,26,255,0.08)',   border: 'rgba(26,26,255,0.3)' },
};

const CATEGORY_CFG: Record<string, { color: string; emoji: string }> = {
  Study:      { color: 'var(--accent-2)', emoji: '📚' },
  Hackathon:  { color: 'var(--accent)',   emoji: '⚡' },
  Submission: { color: 'var(--accent)',   emoji: '📨' },
  Personal:   { color: 'var(--accent-3)', emoji: '🌱' },
  Exam:       { color: 'var(--amber)',    emoji: '✏️' },
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
  const cCfg      = CATEGORY_CFG[event.category] ?? { color: 'var(--accent-2)', emoji: '📌' };
  const progress  = getProgress(event.deadline);

  const toggle = async () => {
    setLoading(true);
    try { await updateEvent(event.id, { status: completed ? 'pending' : 'completed' }); }
    catch { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  const remove = async () => {
    if (!confirm('Delete this deadline?')) return;
    setLoading(true);
    try { await deleteEvent(event.id); }
    catch { toast.error('Delete failed'); }
    finally { setLoading(false); }
  };

  const borderColor = overdue && !completed ? 'var(--accent)' : completed ? 'var(--border)' : 'var(--border)';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: completed ? 0.55 : 1, y: 0, filter: completed ? 'grayscale(0.5)' : 'none' }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={completed ? {} : {
        y: -5,
        boxShadow: `5px 5px 0 ${overdue ? 'var(--accent)' : 'var(--ink)'}`,
        x: -2,
      }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] as any }}
      className="group relative rounded-2xl p-5 flex flex-col gap-4 border-2 cursor-default"
      style={{ borderColor, background: 'var(--white)' }}
    >
      {/* Top cap color bar */}
      <div
        className="absolute top-0 left-5 right-5 h-[3px] rounded-b-full"
        style={{ background: completed ? 'var(--border)' : overdue ? 'var(--accent)' : pCfg.color }}
      />

      {/* Header */}
      <div className="flex items-start justify-between pt-1">
        <div className="flex flex-wrap gap-1.5">
          <span
            className="tag text-[10px]"
            style={{ color: cCfg.color, borderColor: cCfg.color, background: `${cCfg.color}10` }}
          >
            {cCfg.emoji} {event.category}
          </span>
          <span
            className="tag text-[10px]"
            style={{ color: pCfg.color, borderColor: pCfg.color, background: pCfg.bg }}
          >
            {pCfg.label}
          </span>
          {overdue && !completed && (
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.6 }}
              className="tag text-[10px]"
              style={{ color: 'var(--accent)', borderColor: 'var(--accent)', background: 'rgba(255,85,51,0.08)' }}
            >
              <AlertTriangle size={10} /> OVERDUE
            </motion.span>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={() => onEdit(event)}
            className="p-1.5 rounded-lg border-2 hover:border-ink transition-all"
            style={{ borderColor: 'var(--border)' }}
          >
            <Pencil size={13} style={{ color: 'var(--ink-3)' }} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={remove}
            disabled={loading}
            className="p-1.5 rounded-lg border-2 transition-all"
            style={{ borderColor: 'transparent' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
          >
            <Trash2 size={13} style={{ color: 'var(--accent)' }} />
          </motion.button>
        </div>
      </div>

      {/* Title */}
      <h3
        className={`font-display font-bold text-[15px] leading-snug line-clamp-2 ${completed ? 'line-through' : ''}`}
        style={{ color: completed ? 'var(--ink-4)' : 'var(--ink)' }}
      >
        {event.title}
      </h3>

      {event.description && (
        <p className="text-xs font-medium line-clamp-2 leading-relaxed -mt-2" style={{ color: 'var(--ink-4)' }}>
          {event.description}
        </p>
      )}

      {/* Progress bar */}
      {!completed && (
        <div className="h-2 rounded-full border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--paper-2)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="h-full"
            style={{
              background: overdue ? 'var(--accent)' : progress > 80 ? 'var(--amber)' : 'var(--ink)',
            }}
          />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t-2" style={{ borderColor: 'var(--paper-2)' }}>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: 'var(--ink-4)' }}>
            <Calendar size={11} /> {fmtDate(event.deadline)}
          </div>
          <div
            className="flex items-center gap-1.5 text-[11px] font-black"
            style={{ color: overdue && !completed ? 'var(--accent)' : 'var(--ink)' }}
          >
            <Clock size={11} /> {fmtCountdown(event.deadline)}
          </div>
        </div>

        <motion.button
          whileHover={completed
            ? { y: -1 }
            : { x: -2, y: -2, boxShadow: '3px 3px 0 var(--ink)' }
          }
          whileTap={{ x: 0, y: 0, boxShadow: 'none' }}
          onClick={toggle}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black border-2 transition-all"
          style={
            completed
              ? { borderColor: 'var(--border)', color: 'var(--ink-4)', background: 'var(--paper)' }
              : { borderColor: 'var(--ink)', color: '#fff', background: 'var(--ink)' }
          }
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
          {completed ? 'Reopen' : 'Complete'}
        </motion.button>
      </div>
    </motion.div>
  );
}
