'use client';

import { DeadlineEvent } from '@/types';
import { updateEvent, deleteEvent } from '@/lib/firestore';
import { Clock, CheckCircle2, MoreVertical, Trash2, Edit2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { getPriorityColor, getEffectivePriority, getTimeRemaining, isOverdue } from '@/utils/priority';
import { formatDateLabel } from '@/utils/dateHelpers';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

const PRIORITY_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  high:   { label: 'High',   bg: 'rgba(244,63,94,0.12)',  text: '#F43F5E' },
  medium: { label: 'Medium', bg: 'rgba(245,158,11,0.12)', text: '#F59E0B' },
  low:    { label: 'Low',    bg: 'rgba(16,185,129,0.12)', text: '#10B981' },
  auto:   { label: 'Auto',   bg: 'rgba(124,58,237,0.12)', text: '#A78BFA' },
};

export function EventCard({ event, onEdit }: { event: DeadlineEvent; onEdit: (e: DeadlineEvent) => void }) {
  const [menu, setMenu] = useState(false);
  const overdue  = isOverdue(event);
  const p        = getEffectivePriority(event);
  const pCfg     = PRIORITY_LABELS[p] ?? PRIORITY_LABELS.auto;
  const color    = getPriorityColor(event);
  const done     = event.status === 'completed';

  const toggleStatus = async () => {
    try {
      await updateEvent(event.id, { status: done ? 'pending' : 'completed' });
      toast.success(done ? 'Task re-opened' : 'Task completed!');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const remove = async () => {
    if (!confirm(`Delete "${event.title}"?`)) return;
    try {
      await deleteEvent(event.id);
      toast.success('Task deleted');
    } catch {
      toast.error('Could not delete task');
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -10 }}
      transition={{ layout: { type: 'spring', bounce: 0.25, duration: 0.5 } }}
      className={cn(
        'relative glass-hi rounded-2xl p-5 flex flex-col gap-4 group overflow-hidden card-lift',
        done && 'opacity-50',
      )}
    >
      {/* Left edge accent */}
      <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full" style={{ background: done ? '#374151' : color, boxShadow: done ? 'none' : `0 0 10px ${color}` }} />

      {/* Top row */}
      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {/* Priority badge */}
          <span className="pill text-[0.65rem]" style={{ background: pCfg.bg, color: pCfg.text, border: `1px solid ${pCfg.text}25` }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: pCfg.text }} />
            {pCfg.label}
          </span>
          {/* Category badge */}
          <span className="pill bg-white/[0.06] text-[--c-muted] border border-white/[0.06] text-[0.65rem]">
            {event.category}
          </span>
        </div>

        {/* Menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setMenu(s => !s)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[--c-muted] hover:text-white hover:bg-white/[0.08] transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical size={15} />
          </button>
          <AnimatePresence>
            {menu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 5 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-1 w-40 glass-hi rounded-xl border border-white/[0.07] shadow-[0_12px_40px_rgba(0,0,0,0.6)] p-1.5 z-20"
              >
                <button
                  onClick={() => { onEdit(event); setMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/[0.07] transition-colors"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => { remove(); setMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-[#F43F5E] hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Title */}
      <div className="pl-2">
        <h3 className={cn('text-[1rem] font-bold tracking-tight text-white leading-snug', done && 'line-through text-[--c-muted]')}>
          {event.title}
        </h3>
        {event.description && (
          <p className="text-xs text-[--c-muted] mt-1.5 line-clamp-2 leading-relaxed font-medium">
            {event.description}
          </p>
        )}
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between pl-2 gap-2">
        <div className={cn('flex items-center gap-1.5 text-[0.72rem] font-semibold', overdue && !done ? 'text-[#F43F5E]' : 'text-[--c-muted]')}>
          {overdue && !done ? <AlertTriangle size={12} /> : <Clock size={12} />}
          {done ? formatDateLabel(event.deadline) : (overdue ? 'Overdue' : getTimeRemaining(event.deadline))}
        </div>
        <span className="text-[0.65rem] font-medium text-[--c-muted]">{formatDateLabel(event.deadline)}</span>
      </div>

      {/* Progress bar strip */}
      <div className="h-[2px] w-full bg-white/[0.05] rounded-full overflow-hidden pl-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: done ? '100%' : overdue ? '100%' : `${Math.min(100, Math.max(5, 100 - ((new Date(event.deadline instanceof Object && 'toDate' in event.deadline ? event.deadline.toDate() : new Date(event.deadline as string)).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 7)) * 100))}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: done ? '#10B981' : overdue ? '#F43F5E' : color }}
        />
      </div>

      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        onClick={toggleStatus}
        className={cn(
          'ml-2 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all',
          done
            ? 'bg-white/[0.05] text-[--c-muted] hover:bg-white/[0.08] border border-white/[0.06]'
            : 'text-white grad-accent glow-accent hover:opacity-90'
        )}
      >
        {done ? <><CheckCircle2 size={14} /> Completed</> : 'Mark Complete'}
      </motion.button>
    </motion.article>
  );
}
