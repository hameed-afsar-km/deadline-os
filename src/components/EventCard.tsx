'use client';

import { DeadlineEvent } from '@/types';
import { updateEvent, deleteEvent } from '@/lib/firestore';
import { Clock, CheckCircle2, MoreVertical, Trash2, Edit2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
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
      toast.success(event.status === 'pending' ? 'Task marked complete' : 'Task pending');
    } catch { toast.error('Failed to sync state'); }
  };

  const remove = async () => {
    if (confirm('Delete this deadline?')) {
      try {
        await deleteEvent(event.id);
        toast.success('Deleted permanently');
      } catch { toast.error('Failed to delete'); }
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y:20 }} animate={{ opacity: 1, scale: 1, y:0 }} exit={{ opacity: 0, scale: 0.95, y:-20 }}
      whileHover={{ y: -4 }}
      transition={{ layout: { type: 'spring', bounce: 0.2, duration: 0.6 } }}
      className={cn(
        "relative p-8 rounded-[32px] overflow-hidden glass-card glass-card-hover group",
        event.status === 'completed' ? "opacity-50 saturate-0 hover:saturate-100 transition-all duration-500" : (overdue ? "border-rose-500/30" : "")
      )}
    >
      {/* Background Glow */}
      <div 
        className="absolute -top-20 -left-20 w-48 h-48 rounded-full blur-[64px] opacity-20 transition-opacity duration-500 group-hover:opacity-40 pointer-events-none"
        style={{ background: color }}
      />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ rotate: 15 }} className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm shadow-inner">
              {CAT_ICON[event.category] || '📌'}
            </motion.div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border backdrop-blur-md bg-opacity-20 flex items-center gap-2" 
                  style={{ color, borderColor: `${color}30`, backgroundColor: `${color}10` }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow:`0 0 8px ${color}` }} />
              {event.category}
            </span>
          </div>
          <h3 className={cn("text-2xl font-bold tracking-tight mt-2 transition-colors", event.status === 'completed' ? "text-zinc-500 line-through" : "text-white")}>
            {event.title}
          </h3>
        </div>

        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-transparent hover:border-white/10">
            <MoreVertical size={18} />
          </button>
          
          <AnimatePresence>
            {menuOpen && (
              <motion.div initial={{ opacity:0, y:8, scale:.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:8, scale:.95 }} transition={{ duration: 0.15 }}
                className="absolute right-0 top-[calc(100%+8px)] w-40 rounded-2xl glass-panel shadow-2xl z-20 p-2 overflow-hidden flex flex-col gap-1">
                <button onClick={() => { onEdit(event); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl hover:bg-white/10 text-white transition-colors">
                  <Edit2 size={16} /> Edit
                </button>
                <button onClick={() => { remove(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl hover:bg-rose-500/20 text-rose-400 transition-colors">
                  <Trash2 size={16} /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-zinc-400 font-medium leading-relaxed line-clamp-2 h-10 mb-8 relative z-10">
        {event.description || 'No context attached to this node.'}
      </p>

      {/* Stats Bar */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className={cn("flex items-center gap-2 px-4 py-2 rounded-xl border", overdue ? "bg-rose-500/10 border-rose-500/20" : "bg-white/5 border-white/10")}>
          {overdue ? <AlertCircle size={14} className="text-rose-400" /> : <Clock size={14} className="text-zinc-400" />}
          <span className={cn("text-xs font-bold tracking-widest uppercase", overdue ? "text-rose-400" : "text-zinc-300")}>
            {getTimeRemaining(event.deadline)}
          </span>
        </div>
        <div className="flex items-center gap-2 px-3">
          <span className="text-[10px] font-black tracking-[0.2em] text-zinc-600 uppercase">{event.priority}</span>
        </div>
      </div>

      {/* Progress Line */}
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mb-8 relative z-10">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: event.status === 'completed' ? '100%' : '25%' }} 
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="h-full rounded-full relative"
          style={{ background: event.status === 'completed' ? '#10B981' : color, boxShadow: `0 0 10px ${event.status === 'completed' ? '#10B981' : color}` }}
        />
      </div>

      {/* Interaction */}
      <div className="relative z-10">
        <motion.button 
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={toggleStatus}
          className={cn(
            "flex items-center gap-3 px-6 py-4 rounded-2xl text-xs uppercase tracking-widest font-black transition-all w-full justify-center shadow-lg border",
            event.status === 'completed' 
              ? "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white" 
              : "bg-gradient-to-r from-indigo-500 to-cyan-500 border-indigo-400/50 text-white shadow-indigo-500/20 hover:shadow-cyan-500/40"
          )}
        >
          {event.status === 'completed' ? <CheckCircle2 size={18} /> : <div className="w-3.5 h-3.5 rounded-full border-[3px] border-white/80 animate-pulse" />}
          {event.status === 'completed' ? 'Completed' : 'Initialize Action'}
        </motion.button>
      </div>
    </motion.div>
  );
}
