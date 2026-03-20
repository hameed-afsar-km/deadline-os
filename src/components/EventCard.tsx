'use client';

import { DeadlineEvent } from '@/types';
import { updateEvent, deleteEvent } from '@/lib/firestore';
import { Clock, CheckCircle2, MoreVertical, Trash2, Edit2, AlertCircle } from 'lucide-react';
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
      initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
      className={cn(
        "relative p-6 bg-white rounded-2xl border transition-all card-shadow card-hover",
        event.status === 'completed' ? "opacity-60 saturate-50 border-slate-200" : (overdue ? "border-red-200" : "border-slate-200")
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-col gap-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-sm">{CAT_ICON[event.category] || '📌'}</span>
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md" style={{ color, backgroundColor: `${color}15` }}>
              {event.category}
            </span>
          </div>
          <h3 className={cn("text-lg font-bold leading-tight mt-1", event.status === 'completed' ? "text-slate-500 line-through" : "text-slate-900")}>
            {event.title}
          </h3>
        </div>

        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
            <MoreVertical size={18} />
          </button>
          
          <AnimatePresence>
            {menuOpen && (
              <motion.div initial={{ opacity:0, y:4, scale:.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:4, scale:.95 }} transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-slate-200 bg-white shadow-xl z-20 py-1 overflow-hidden">
                <button onClick={() => { onEdit(event); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-slate-50 text-slate-700 transition-colors">
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={() => { remove(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-red-50 text-red-600 transition-colors">
                  <Trash2 size={14} /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2 h-10 mb-6">
        {event.description || 'No description provided.'}
      </p>

      {/* Stats Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-100">
          {overdue ? <AlertCircle size={14} className="text-red-500" /> : <Clock size={14} className="text-slate-400" />}
          <span className={cn("text-xs font-bold tracking-tight", overdue ? "text-red-600" : "text-slate-600")}>
            {getTimeRemaining(event.deadline)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 capitalize">{event.priority} Priority</span>
        </div>
      </div>

      {/* Progress Line */}
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-5">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: event.status === 'completed' ? '100%' : '35%' }} 
          className="h-full rounded-full transition-all duration-500"
          style={{ background: event.status === 'completed' ? '#10B981' : color }}
        />
      </div>

      {/* Interaction */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <motion.button 
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={toggleStatus}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all w-full justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]",
            event.status === 'completed' 
              ? "bg-slate-100 text-slate-500 hover:bg-slate-200" 
              : "bg-blue-600 text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700"
          )}
        >
          {event.status === 'completed' ? <CheckCircle2 size={16} /> : <div className="w-3 h-3 rounded-full border-2 border-white/60" />}
          {event.status === 'completed' ? 'Completed' : 'Mark as Done'}
        </motion.button>
      </div>
    </motion.div>
  );
}
