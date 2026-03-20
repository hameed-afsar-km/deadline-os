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
        toast.success('Sequence updated');
      } else {
        await createEvent(user.uid, data);
        toast.success('Node injected successfully');
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Connection fault detected.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 perspective-1000">
      {/* Backdrop */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration: 0.5 }}
        onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-3xl" />

      {/* Modal / Panel */}
      <motion.div
        initial={{ opacity:0, scale:0.9, rotateX: 10, y:20 }}
        animate={{ opacity:1, scale:1, rotateX: 0, y:0 }}
        exit={{ opacity:0, scale:0.95, rotateX: -10, y:20 }}
        transition={{ duration:.4, type:'spring', bounce:0.3 }}
        className="relative z-10 w-full max-w-[500px] glass-panel rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,1)] border border-white/10 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px] -mx-20 -mt-20 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-8 border-b border-white/5 relative z-10">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-white drop-shadow-lg">
              {event ? 'Modify Node' : 'Initialize Node'}
            </h2>
            <p className="text-xs text-cyan-400 uppercase tracking-widest font-bold mt-2">Configure target parameters</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="p-8 space-y-6 relative z-10">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1 drop-shadow-sm">Designation</label>
            <input type="text" required autoFocus value={form.title} onChange={e=>setForm({...form,title:e.target.value})}
              placeholder="Primary objective"
              className="w-full px-5 py-4 text-sm font-semibold bg-black/40 border border-white/10 rounded-2xl focus:bg-black/60 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 outline-none transition-all placeholder:text-zinc-600 text-white shadow-inner" />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Terminal State (T-0)</label>
              <input type="datetime-local" required value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})}
                className="w-full px-5 py-4 text-sm font-semibold bg-black/40 border border-white/10 rounded-2xl focus:bg-black/60 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 outline-none transition-all text-white shadow-inner" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Vector Category</label>
              <input list="cats" type="text" required value={form.category} onChange={e=>setForm({...form,category:e.target.value})}
                placeholder="Ex. Core"
                className="w-full px-5 py-4 text-sm font-semibold bg-black/40 border border-white/10 rounded-2xl focus:bg-black/60 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 outline-none transition-all placeholder:text-zinc-600 text-white shadow-inner" />
              <datalist id="cats">
                {SUGGESTED_CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </datalist>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Directive Details (Optional)</label>
            <textarea rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}
              placeholder="Attach relevant telemetry data..."
              className="w-full px-5 py-4 text-sm font-semibold bg-black/40 border border-white/10 rounded-2xl focus:bg-black/60 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 outline-none transition-all resize-none placeholder:text-zinc-600 text-white shadow-inner" />
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-white/5">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 py-4 text-xs tracking-widest font-black uppercase rounded-2xl glass-panel hover:bg-white/10 text-zinc-400 hover:text-white transition-colors border border-white/5">
              Abort
            </button>
            <button type="submit" disabled={loading}
              className="flex-[2] py-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 hover:scale-[1.02] active:scale-95 text-white shadow-[0_0_30px_rgba(99,102,241,0.3)] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all disabled:opacity-50">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Terminal size={14} />}
              {event ? 'Update Protocol' : 'Deploy Node'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
