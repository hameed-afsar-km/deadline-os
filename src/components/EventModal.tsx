'use client';

import { DeadlineEvent } from '@/types';
import { createEvent, updateEvent } from '@/lib/firestore';
import { useUserStore } from '@/store/useUserStore';
import { X, Loader2, Save, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { toInputDatetimeLocal } from '@/utils/dateHelpers';
import { Priority, Status } from '@/types';
import { cn } from '@/utils/cn';
import { GlowingShadow } from '@/components/ui/glowing-shadow';

const SUGGESTED_CATS = ['hackathons', 'Assignments', 'competitions', 'Test', 'Client', 'Custom'];

const FIELD_CLASS = 'inp w-full text-sm';

export function EventModal({ event, onClose }: { event: DeadlineEvent | null; onClose: () => void }) {
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    deadline: '',
    category: 'Work',
    priority: 'auto' as Priority,
    status: 'pending' as Status,
  });

  useEffect(() => {
    if (event) {
      setForm({
        title:       event.title,
        description: event.description || '',
        deadline:    toInputDatetimeLocal(event.deadline),
        category:    event.category,
        priority:    event.priority,
        status:      event.status,
      });
    } else {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      setForm(f => ({ ...f, deadline: toInputDatetimeLocal(d.toISOString()) }));
    }
  }, [event]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error('Not authenticated');
    setLoading(true);
    try {
      const data = {
        title:       form.title,
        description: form.description,
        deadline:    form.deadline,
        category:    form.category,
        priority:    form.priority,
        status:      form.status,
        reminders:   [] as string[],
      };
      if (event) {
        await updateEvent(event.id, data);
        toast.success('Task updated');
      } else {
        await createEvent(user.uid, data);
        toast.success('Task created');
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      {/* Sheet / Modal */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.98 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full md:max-w-[500px] glass-hi border border-white/10 rounded-t-[32px] md:rounded-[32px] shadow-[0_40px_120px_rgba(0,0,0,0.9)] overflow-hidden z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-7 border-b border-white/[0.05]">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">{event ? 'Modify Task' : 'New Objective'}</h2>
            <p className="text-xs text-zinc-500 font-medium mt-1">Refine your workspace data points</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-2xl glass border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all hover:scale-110 active:scale-90 shadow-inner">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="p-8 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Title</label>
            <input
              type="text" required autoFocus
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Design System Sprint"
              className={FIELD_CLASS}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Deadline Date</label>
              <input
                type="datetime-local" required
                value={form.deadline}
                onChange={e => setForm({ ...form, deadline: e.target.value })}
                className={FIELD_CLASS}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Category</label>
              <input
                list="cats"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                placeholder="Category"
                className={FIELD_CLASS}
              />
              <datalist id="cats">
                {SUGGESTED_CATS.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value as Priority })}
                className={cn(FIELD_CLASS, 'appearance-none cursor-pointer')}
              >
                <option value="auto">Auto-Select</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Status</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as Status })}
                className={cn(FIELD_CLASS, 'appearance-none cursor-pointer')}
              >
                <option value="pending">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Add more details about this task..."
              className={`${FIELD_CLASS} resize-none min-h-[100px]`}
            />
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button type="button" onClick={onClose} disabled={loading}
              className="px-6 py-4 rounded-2xl text-sm font-bold text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/5 active:scale-95">
              Discard
            </button>
            <GlowingShadow type="submit" disabled={loading} className="flex-[2]">
              <div className="flex items-center justify-center gap-2 text-sm font-bold">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {event ? 'Sync Changes' : 'Initialize Task'}
              </div>
            </GlowingShadow>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
