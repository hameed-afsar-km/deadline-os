'use client';

import { DeadlineEvent } from '@/types';
import { updateEvent, deleteEvent } from '@/lib/firestore';
import { Clock, CheckCircle2, MoreVertical, Trash2, Zap, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState, useRef, useEffect } from 'react';
import { getPriorityColor, getTimeRemaining, isOverdue } from '@/utils/priority';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

const CAT_ICON: Record<string, string> = { Study: '📚', Hackathon: '⚡', Submission: '📨', Personal: '🌿', Exam: '✏️' };

export function EventCard({ event, onEdit }: { event: DeadlineEvent; onEdit: (e: DeadlineEvent) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const overdue = isOverdue(event) && event.status === 'pending';
  const color   = getPriorityColor(event);

  const toggleStatus = async () => {
    try {
      await updateEvent(event.id, { status: event.status === 'pending' ? 'completed' : 'pending' });
      toast.success(event.status === 'pending' ? 'CRITICAL_RESOLVED' : 'STATUS_PENDING');
    } catch { toast.error('SYNC_ERROR'); }
  };

  const remove = async () => {
    if (confirm('TERMINATE_RECORD?')) {
      try {
        await deleteEvent(event.id);
        toast.success('RECORD_DELETED');
      } catch { toast.error('SYNC_ERROR'); }
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5, boxShadow: `0 10px 40px -10px ${color}20` }}
      className={cn(
        "relative p-6 glass-card rounded-2xl transition-all border border-white/5",
        event.status === 'completed' ? "opacity-60 saturate-[0.2]" : "hover:border-white/10"
      )}
    >
      {/* Glow Effect */}
      {overdue && (
        <div className="absolute inset-0 pointer-events-none rounded-2xl animate-pulse" 
             style={{ boxShadow: `inset 0 0 40px -20px #ef4444`, border: '1px solid rgba(239, 68, 68, 0.2)' }} />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xl">{CAT_ICON[event.category] || '📌'}</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color }}>{event.category}</span>
          </div>
          <h3 className="text-xl font-black tracking-tighter leading-none mt-1">{event.title}</h3>
        </div>

        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-slate-500 hover:text-white transition-all">
            <MoreVertical size={18} />
          </button>
          
          <AnimatePresence>
            {menuOpen && (
              <motion.div initial={{ opacity:0, y:8, scale:.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:4, scale:.97 }}
                className="absolute right-0 top-[calc(100%+8px)] w-48 rounded-2xl border border-white/5 bg-slate-900/90 backdrop-blur-2xl shadow-2xl z-20 py-1.5">
                <button onClick={() => { onEdit(event); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-black tracking-widest uppercase hover:bg-white/5 text-slate-300">
                  EDIT_NODE
                </button>
                <button onClick={() => { remove(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-black tracking-widest uppercase hover:bg-rose-500/10 text-rose-500">
                  TERMINATE
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-400 font-medium leading-relaxed line-clamp-2 mb-10 h-10">
        {event.description || 'NO_CONTEXT_PROVIDED'}
      </p>

      {/* Stats Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {overdue ? <AlertCircle size={14} className="text-rose-500 animate-pulse" /> : <Clock size={14} className="text-slate-500" />}
          <span className={cn("text-xs font-black tracking-widest uppercase", overdue ? "text-rose-500" : "text-slate-400")}>
            {getTimeRemaining(event.deadline)}
          </span>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg border border-white/5 bg-white/[0.04]">
          <Zap size={10} className="text-violet-500" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">{event.priority}</span>
        </div>
      </div>

      {/* Progress Line */}
      <div className="h-[2px] w-full bg-slate-900 rounded-full overflow-hidden mb-6">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: event.status === 'completed' ? '100%' : '35%' }} 
          className="h-full rounded-full"
          style={{ background: event.status === 'completed' ? '#10B981' : color, boxShadow: `0 0 10px ${color}` }}
        />
      </div>

      {/* Interaction */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <motion.button 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={toggleStatus}
          className={cn(
            "flex items-center gap-2.5 px-4 py-2.5 rounded-xl border font-black text-[10px] tracking-widest uppercase transition-all",
            event.status === 'completed' 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-white/5 border-white/10 text-slate-400 hover:border-violet-500/30 hover:text-violet-400"
          )}
        >
          {event.status === 'completed' ? <CheckCircle2 size={16} /> : <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-500" />}
          {event.status === 'completed' ? 'SUCCESS' : 'INITIALIZE'}
        </motion.button>

        <span className="text-[10px] font-black text-slate-600 tracking-tighter flex items-center gap-1">
          NODE <span className="text-slate-500">#{event.id.slice(-4).toUpperCase()}</span>
        </span>
      </div>
    </motion.div>
  );
}
