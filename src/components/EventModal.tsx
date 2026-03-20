'use client';

import { useState, useEffect } from 'react';
import { DeadlineEvent } from '@/types';
import { createEvent, updateEvent } from '@/lib/firestore';
import { useUserStore } from '@/store/useUserStore';
import { X, Loader2, Save, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { Timestamp } from 'firebase/firestore';
import { Category, Priority, Status } from '@/types';
import { motion } from 'framer-motion';
import { toDate } from '@/utils/dateHelpers';

interface EventModalProps {
  event: DeadlineEvent | null;
  onClose: () => void;
}

const CATEGORIES = ['Study', 'Hackathon', 'Submission', 'Personal', 'Exam'];

export function EventModal({ event, onClose }: EventModalProps) {
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    category: 'Study' as Category,
  });

  useEffect(() => {
    if (event) {
      let dStr = '';
      const dObj = toDate(event.deadline);
      const tzOffset = dObj.getTimezoneOffset() * 60000; // offset in milliseconds
      const localISOTime = (new Date(dObj.getTime() - tzOffset)).toISOString().slice(0, 16);
      dStr = localISOTime;
      setFormData({
        title: event.title,
        description: event.description || '',
        deadline: dStr,
        category: event.category,
      });
    } else {
      const now = new Date();
      now.setHours(now.getHours() + 24);
      setFormData(prev => ({ ...prev, deadline: now.toISOString().slice(0, 16) }));
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error('not authenticated');
    
    const d = new Date(formData.deadline);
    if (d <= new Date() && !event) {
      return toast.error('Deadline must be in the future');
    }

    setLoading(true);
    try {
      const dbData = {
        ...formData,
        deadline: Timestamp.fromDate(d),
        reminders: [],
        priority: 'auto' as Priority,
        status: 'pending' as Status,
      };
      if (event) {
        await updateEvent(event.id, dbData);
        toast.success('Deadline updated');
      } else {
        await createEvent(user.uid, dbData);
        toast.success('Deadline created');
      }
      onClose();
    } catch {
      toast.error('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0"
        style={{ background: 'rgba(12,10,9,0.85)', backdropFilter: 'blur(12px)' }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as any }}
        className="relative z-10 w-full max-w-lg card p-7 overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-3">
          <motion.button
            whileHover={{ scale: 1.1, background: 'var(--s3)' }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 rounded-xl transition-colors"
            style={{ color: 'var(--t3)' }}
          >
            <X size={20} />
          </motion.button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center glow-sm"
               style={{ background: 'linear-gradient(135deg, #F59E0B, #B45309)', color: '#0C0A09' }}>
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--t0)' }}>
              {event ? 'Edit deadline' : 'New deadline'}
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest mt-0.5" style={{ color: 'var(--amber)' }}>
              Stay on track
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2 ml-1" style={{ color: 'var(--t3)' }}>
              What's it called?
            </label>
            <input
              type="text" required autoFocus
              value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Quantum Physics Paper"
              className="field w-full px-4 py-3"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 ml-1" style={{ color: 'var(--t3)' }}>
                When is it due?
              </label>
              <input
                type="datetime-local" required
                value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                className="field w-full px-4 py-3"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 ml-1" style={{ color: 'var(--t3)' }}>
                Category
              </label>
              <select
                value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                className="field w-full px-4 py-3 appearance-none cursor-pointer"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2 ml-1" style={{ color: 'var(--t3)' }}>
              Extra details (optional)
            </label>
            <textarea
              rows={3}
              value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add links, rubrics, or notes..."
              className="field w-full px-4 py-3 resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t mt-6" style={{ borderColor: 'var(--b1)' }}>
            <motion.button
              type="button" onClick={onClose} disabled={loading}
              whileHover={{ backgroundColor: 'var(--s4)' }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2.5 rounded-xl font-bold text-sm transition-colors border"
              style={{ background: 'var(--s2)', borderColor: 'var(--b1)', color: 'var(--t1)' }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: 1.03, boxShadow: '0 0 24px rgba(245,158,11,0.3)' }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #B45309)', color: '#0C0A09' }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {event ? 'Save changes' : 'Create deadline'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
