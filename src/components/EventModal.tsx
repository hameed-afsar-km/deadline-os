'use client';

import { DeadlineEvent } from '@/types';
import { createEvent, updateEvent } from '@/lib/firestore';
import { useUserStore } from '@/store/useUserStore';
import { X, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { toInputDatetimeLocal } from '@/utils/dateHelpers';
import { Priority, Status } from '@/types';

const SUGGESTED_CATS = ['Study', 'Work', 'Exam', 'Project', 'Hackathon', 'Submission', 'Personal', 'Health', 'Finance'];

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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Sheet / Modal */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full md:max-w-[480px] glass-hi border border-white/[0.08] rounded-t-3xl md:rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,0.9)] overflow-hidden z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07]">
          <div>
            <h2 className="text-[1.1rem] font-bold text-white tracking-tight">{event ? 'Edit Task' : 'New Task'}</h2>
            <p className="text-xs text-[--c-muted] font-medium mt-0.5">{event ? 'Update the task details below.' : 'Fill in the details to create a new task.'}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl glass border border-white/[0.07] flex items-center justify-center text-[--c-muted] hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="p-6 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[--c-muted] uppercase tracking-wide">Task Title *</label>
            <input
              type="text" required autoFocus
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Submit assignment"
              className={FIELD_CLASS}
            />
          </div>

          {/* Deadline + Category side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[--c-muted] uppercase tracking-wide">Deadline *</label>
              <input
                type="datetime-local" required
                value={form.deadline}
                onChange={e => setForm({ ...form, deadline: e.target.value })}
                className={FIELD_CLASS}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[--c-muted] uppercase tracking-wide">Category</label>
              <input
                list="cats"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Study"
                className={FIELD_CLASS}
              />
              <datalist id="cats">
                {SUGGESTED_CATS.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
          </div>

          {/* Priority + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[--c-muted] uppercase tracking-wide">Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value as Priority })}
                className={FIELD_CLASS}
              >
                <option value="auto">Auto (Smart)</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[--c-muted] uppercase tracking-wide">Status</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as Status })}
                className={FIELD_CLASS}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[--c-muted] uppercase tracking-wide">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Optional notes about this task…"
              className={`${FIELD_CLASS} resize-none`}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1 border-t border-white/[0.06]">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-[--c-muted] glass border border-white/[0.07] hover:text-white hover:border-white/[0.14] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-[2] py-3 rounded-xl text-sm font-bold text-white grad-accent hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60 glow-accent">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={15} />}
              {event ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
