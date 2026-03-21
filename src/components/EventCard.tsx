'use client';

import { DeadlineEvent } from '@/types';
import { updateEvent, deleteEvent } from '@/lib/firestore';
import { Clock, CheckCircle2, MoreVertical, Trash2, Edit2, AlertTriangle, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState, useRef, useEffect } from 'react';
import { getPriorityColor, getEffectivePriority, getTimeRemaining, isOverdue } from '@/utils/priority';
import { formatDateLabel } from '@/utils/dateHelpers';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { DeleteModal } from './DeleteModal';

const PRIORITY_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  high:   { label: 'High Priority',   bg: 'rgba(244,63,94,0.1)',  text: '#F43F5E' },
  medium: { label: 'Medium', bg: 'rgba(245,158,11,0.1)', text: '#F59E0B' },
  low:    { label: 'Low',    bg: 'rgba(16,185,129,0.1)', text: '#10B981' },
  auto:   { label: 'Flexible',   bg: 'rgba(99,102,241,0.1)', text: '#818CF8' },
};

export function EventCard({ event, onEdit }: { event: DeadlineEvent; onEdit: (e: DeadlineEvent) => void }) {
  const [menu, setMenu] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const overdue  = isOverdue(event);
  const p        = getEffectivePriority(event);
  const pCfg     = PRIORITY_LABELS[p] ?? PRIORITY_LABELS.auto;
  const color    = getPriorityColor(event);
  const done     = event.status === 'completed';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    if (menu) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menu]);

  const toggleStatus = async () => {
    try {
      await updateEvent(event.id, { status: done ? 'pending' : 'completed' });
      toast.success(done ? 'Task re-opened' : 'Task completed!');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const remove = async () => {
    try {
      await deleteEvent(event.id);
      toast.success('Task removed from workspace');
    } catch {
      toast.error('Could not delete task');
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={cn(
        'group relative bg-[#0A0A0A] rounded-[20px] p-5 flex flex-col gap-5 transition-all hover:bg-[#121212] border border-white/5 hover:border-white/10 shadow-sm',
        done && 'opacity-50 grayscale-[0.8]',
      )}
    >
      <div className="flex items-start justify-between">
         <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border border-white/5" style={{ background: pCfg.bg, color: pCfg.text }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: pCfg.text, boxShadow: `0 0 8px ${pCfg.text}60` }} />
              {pCfg.label}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/[0.05] text-zinc-400 text-[10px] font-bold border border-white/5">
              {event.category}
            </span>
         </div>

         <div className="relative" ref={menuRef}>
            <button onClick={() => setMenu(!menu)} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.05] transition-all opacity-0 group-hover:opacity-100">
               <MoreVertical size={16} />
            </button>
            <AnimatePresence>
              {menu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                  className="absolute right-0 top-full mt-2 w-44 bg-[#0A0A0A] rounded-xl border border-white/10 shadow-2xl p-1 z-50 overflow-hidden"
                >
                  <button onClick={() => { onEdit(event); setMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-colors">
                    <Edit2 size={14} className="text-zinc-500" /> Edit Details
                  </button>
                  <button onClick={() => { setShowDelete(true); setMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors">
                    <Trash2 size={14} /> Remove Entry
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
         </div>
      </div>

      <div className="space-y-1.5 flex-1">
        <h3 className={cn('text-base font-semibold tracking-tight text-white leading-tight', done && 'line-through text-zinc-500')}>
          {event.title}
        </h3>
        {event.description && (
          <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed font-medium">
            {event.description}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4 pt-4 border-t border-white/[0.04]">
        <div className="flex items-center justify-between text-[11px] font-semibold">
          <div className={cn('flex items-center gap-1.5', overdue && !done ? 'text-rose-500' : 'text-zinc-400')}>
            {overdue && !done ? <AlertTriangle size={13} /> : <Clock size={13} />}
            <span>{done ? 'Resolved' : (overdue ? 'Past Due' : getTimeRemaining(event.deadline))}</span>
          </div>
          <span className="text-zinc-600">{formatDateLabel(event.deadline)}</span>
        </div>

        <button
          onClick={toggleStatus}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-semibold uppercase tracking-widest transition-all border outline-none',
            done
              ? 'bg-transparent text-zinc-500 border-white/5 hover:bg-white/[0.02] hover:text-white'
              : 'bg-white text-black border-transparent hover:bg-zinc-200 active:scale-[0.98]'
          )}
        >
          {done ? <><CheckCircle2 size={14} /> Reopen Issue</> : 'Mark Complete'}
        </button>
      </div>

      <DeleteModal 
        isOpen={showDelete} 
        onClose={() => setShowDelete(false)} 
        onConfirm={remove} 
        title={event.title} 
      />
    </motion.article>
  );
}
