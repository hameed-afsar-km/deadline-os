'use client';

import { DeadlineEvent } from '@/types';
import { createEvent, updateEvent } from '@/lib/firestore';
import { useUserStore } from '@/store/useUserStore';
import { X, Loader2, Save, Terminal } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { toDate } from '@/utils/dateHelpers';
import { Priority, Status } from '@/types';

const SUGGESTED_CATS = ['Study','Hackathon','Submission','Personal','Project'];

export function EventModal({ event, onClose }: { event:DeadlineEvent|null; onClose:()=>void }) {
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title:'', description:'', deadline:'', category:'Project' });

  useEffect(() => {
    if (event) {
      const d = toDate(event.deadline);
      const offset = d.getTimezoneOffset()*60000;
      const iso = new Date(d.getTime()-offset).toISOString().slice(0,16);
      setForm({ title:event.title, description:event.description||'', deadline:iso, category:event.category });
    } else {
      const d = new Date(); d.setHours(d.getHours()+24);
      const offset = d.getTimezoneOffset()*60000;
      setForm(f => ({ ...f, deadline:new Date(d.getTime()-offset).toISOString().slice(0,16) }));
    }
  }, [event]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error('Authentication Error');
    setLoading(true);
    try {
      const data = {
        ...form,
        reminders: [] as string[],
        priority:  'auto' as Priority,
        status:    (event ? event.status : 'pending') as Status,
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
      toast.error('Failed to sync. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration: 0.15 }}
        onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

      {/* Modal */}
      <motion.div
        initial={{ opacity:0, scale:0.95, y:10 }}
        animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.95, y:10 }}
        transition={{ duration:.2, type:'spring', bounce:.1 }}
        className="relative z-10 w-full max-w-[480px] bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {event ? 'Edit Task' : 'New Task'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">Add a new deadline to your queue.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 ml-0.5">Title</label>
            <input type="text" required autoFocus value={form.title} onChange={e=>setForm({...form,title:e.target.value})}
              placeholder="What needs to be done?"
              className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 text-slate-900" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 ml-0.5">Due Date</label>
              <input type="datetime-local" required value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})}
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 ml-0.5">Category</label>
              <input list="cats" type="text" required value={form.category} onChange={e=>setForm({...form,category:e.target.value})}
                placeholder="Ex. Project"
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 text-slate-900" />
              <datalist id="cats">
                {SUGGESTED_CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </datalist>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 ml-0.5">Description (Optional)</label>
            <textarea rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}
              placeholder="Add links, context, or notes..."
              className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none placeholder:text-slate-400 text-slate-900" />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 py-3.5 text-sm font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-[2] py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {event ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
