'use client';

import { DeadlineEvent } from '@/types';
import { getEffectivePriority, isOverdue } from '@/utils/priority';
import { formatCountdown, formatDeadline } from '@/utils/dateHelpers';
import { updateEvent, deleteEvent } from '@/lib/firestore';
import { CheckCircle2, Clock, Pencil, Trash2, AlertTriangle, Zap, Calendar } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Timestamp } from 'firebase/firestore';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const CATEGORY_CONFIG = {
  Study:      { color: '#6366f1', emoji: '📚' },
  Hackathon:  { color: '#a855f7', emoji: '⚡' },
  Submission: { color: '#f43f5e', emoji: '📨' },
  Personal:   { color: '#10b981', emoji: '🌱' },
  Exam:       { color: '#f59e0b', emoji: '✏️' },
};

const PRIORITY_CONFIG = {
  high:   { color: '#f43f5e', label: 'High' },
  medium: { color: '#f59e0b', label: 'Medium' },
  low:    { color: '#10b981', label: 'Low' },
  auto:   { color: '#6366f1', label: 'Auto' },
};

function getTimeProgress(deadline: unknown): number {
  try {
    const end = deadline instanceof Timestamp ? deadline.toDate() : new Date(deadline as string);
    const now = new Date();
    const created = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 day window
    const total = end.getTime() - created.getTime();
    const elapsed = now.getTime() - created.getTime();
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  } catch { return 0; }
}

interface EventCardProps {
  event: DeadlineEvent;
  onEdit: (event: DeadlineEvent) => void;
}

export function EventCard({ event, onEdit }: EventCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  const effectivePriority = getEffectivePriority(event);
  const overdue = isOverdue(event);
  const catConfig = CATEGORY_CONFIG[event.category] ?? CATEGORY_CONFIG.Personal;
  const priorityConfig = PRIORITY_CONFIG[effectivePriority] ?? PRIORITY_CONFIG.low;
  const completed = event.status === 'completed';
  const progress = getTimeProgress(event.deadline);

  // Framer Motion 3D Hover
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const springConfig = { damping: 20, stiffness: 100, mass: 0.5 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const rotateX = useTransform(springY, [0, 1], [10, -10]);
  const rotateY = useTransform(springX, [0, 1], [-10, 10]);
  const shineOpacity = useTransform(springY, [0, 1], [0, 0.5]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
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
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
      }}
      className={`group relative rounded-3xl p-5 border cursor-default overflow-hidden ${
        completed ? 'opacity-50 grayscale pt-6 pb-6' : 'hover:bg-white/[0.05]'
      } ${overdue && !completed ? 'border-rose-500/30' : 'border-white/[0.05] hover:border-white/20'}`}
    >
      {/* 3D Shine Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-3xl"
        style={{
          opacity: shineOpacity,
          background: `radial-gradient(circle at ${x.get() * 100}% ${y.get() * 100}%, rgba(255,255,255,0.08) 0%, transparent 60%)`,
        }}
      />

      {/* Priority Indicator Line */}
      <div 
        className="absolute top-0 left-0 w-1.5 h-full"
        style={{ 
           backgroundColor: overdue && !completed ? '#f43f5e' : priorityConfig.color,
           boxShadow: `0 0 15px ${overdue && !completed ? '#f43f5e' : priorityConfig.color}` 
        }}
      />

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category */}
          <span 
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
            style={{ backgroundColor: `${catConfig.color}20`, color: catConfig.color }}
          >
            <span>{catConfig.emoji}</span>
            {event.category}
          </span>
          
          {/* Priority */}
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
             style={{ backgroundColor: `${priorityConfig.color}15`, border: `1px solid ${priorityConfig.color}40`, color: priorityConfig.color }}>
             {priorityConfig.label} Prio
          </span>

          {/* Overdue Badge */}
          {overdue && !completed && (
            <motion.span 
              animate={{ opacity: [1, 0.5, 1], scale: [1, 1.05, 1] }} 
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/50"
            >
              <AlertTriangle size={12} /> Overdue
            </motion.span>
          )}
        </div>

        {/* Floating Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
           <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onEdit(event)} className="p-2 rounded-xl bg-white/5 hover:bg-indigo-500/20 text-indigo-400 transition-colors">
             <Pencil size={14} />
           </motion.button>
           <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleDelete} disabled={deleting} className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-rose-400 transition-colors">
             <Trash2 size={14} />
           </motion.button>
        </div>
      </div>

      <h3 className={`font-black text-xl mb-2 text-white line-clamp-2 ${completed && 'line-through text-gray-500'}`}>
        {event.title}
      </h3>

      {event.description && (
        <p className="text-sm text-gray-400 mb-4 line-clamp-3 leading-relaxed">
          {event.description}
        </p>
      )}

      {/* Progress Bar (Time Remaining) */}
      {!completed && (
         <div className="mb-4 space-y-2">
            <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
               <span>Created</span>
               <span>Deadline</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden shadow-default">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${progress}%` }}
                 transition={{ duration: 1, ease: "easeOut" }}
                 className="h-full rounded-full relative"
                 style={{ 
                    background: overdue ? '#f43f5e' : progress > 80 ? '#f59e0b' : '#6366f1',
                    boxShadow: `0 0 10px ${overdue ? '#f43f5e' : progress > 80 ? '#f59e0b' : '#6366f1'}`
                 }}
               />
            </div>
         </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
            <Calendar size={12} /> {formatDeadline(event.deadline)}
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-bold ${overdue && !completed ? 'text-rose-400' : 'text-purple-400'}`}>
            <Clock size={12} /> {formatCountdown(event.deadline)}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleToggleComplete}
          disabled={toggling}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
             completed 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
        >
          {toggling ? <Zap size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
          {completed ? 'Un-complete' : 'Complete'}
        </motion.button>
      </div>

    </motion.div>
  );
}
