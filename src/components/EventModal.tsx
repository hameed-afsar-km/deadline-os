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

const SUGGESTED_CATS = ['Study','Hackathon','Submission','Personal','Exam'];

export function EventModal({ event, onClose }: { event:DeadlineEvent|null; onClose:()=>void }) {
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title:'', description:'', deadline:'', category:'Study' });

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
    if (!user) return toast.error('PROTOCOL_DENIED: AUTHENTICATION_NULL');
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
        toast.success('NODE_UPDATED_SYNC');
      } else {
        await createEvent(user.uid, data);
        toast.success('NEW_NODE_ENTRY_SYNC');
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error('SYNC_FAULT: VERIFY_KEYS_AND_CONNECTION');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Modal — HUD Aesthetic */}
      <motion.div
        initial={{ opacity:0, scale:0.92, y:20 }}
        animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.95, y:12 }}
        transition={{ duration:.4, type:'spring', bounce:.3 }}
        className="relative z-10 w-full max-w-lg cyber-panel p-0 glass-card bg-[#020617]/90 border-white/10 overflow-hidden shadow-[0_32px_128px_-10px_rgba(0,0,0,0.8)]"
        style={{ borderRadius:'24px' }}>

        {/* Neon Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 shadow-[0_0_15px_rgba(139,92,246,0.6)]" />

        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Terminal size={14} className="text-violet-500 animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[.4em] text-violet-500">
                {event ? '§ PATCH_EXISTING_NODE' : '§ INITIALIZE_NEW_NODE'}
              </p>
            </div>
            <h2 className="text-4xl font-black tracking-tighter" style={{ fontFamily:'var(--font-heading)' }}>
              {event ? 'Update Sync' : 'Initialize Queue'}
            </h2>
          </div>
          <motion.button whileHover={{ scale:1.1, backgroundColor:'rgba(255,255,255,0.06)' }} whileTap={{ scale:.9 }}
            onClick={onClose} className="p-3 rounded-xl border border-white/5 transition-all text-slate-500 hover:text-white">
            <X size={20} />
          </motion.button>
        </div>

        <form onSubmit={submit} className="px-8 pb-10 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">
              Label_Identifier
            </label>
            <input type="text" required autoFocus value={form.title} onChange={e=>setForm({...form,title:e.target.value})}
              placeholder="e.g. SUBMIT_FINAL_PROTOTYPE"
              className="w-full px-5 py-4 text-xs font-black tracking-widest uppercase bg-white/[0.03] border border-white/5 rounded-2xl focus:border-violet-500/40 focus:ring-4 focus:ring-violet-500/5 outline-none transition-all placeholder:text-slate-800" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">
                Termination_Window
              </label>
              <input type="datetime-local" required value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})}
                className="w-full px-5 py-4 text-xs font-black tracking-widest uppercase bg-white/[0.03] border border-white/5 rounded-2xl focus:border-violet-500/40 outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">
                Category_Cluster
              </label>
              <input list="cats" type="text" required value={form.category} onChange={e=>setForm({...form,category:e.target.value})}
                placeholder="SELECT_CLUSTER..."
                className="w-full px-5 py-4 text-xs font-black tracking-widest uppercase bg-white/[0.03] border border-white/5 rounded-2xl focus:border-violet-500/40 outline-none transition-all placeholder:text-slate-800" />
              <datalist id="cats">
                {SUGGESTED_CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </datalist>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">
              Node_Metadata
            </label>
            <textarea rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}
              placeholder="ADDITIONAL_CONTEXTS_LINKS_RESOURCES..."
              className="w-full px-5 py-4 text-xs font-black tracking-widest uppercase bg-white/[0.03] border border-white/5 rounded-2xl focus:border-violet-500/40 outline-none transition-all resize-none placeholder:text-slate-800" />
          </div>

          <div className="flex items-center gap-4 pt-4">
            <motion.button type="button" onClick={onClose} disabled={loading}
              whileHover={{ backgroundColor:'rgba(255,255,255,0.06)' }} whileTap={{ scale:.96 }}
              className="flex-1 py-4 text-xs font-black tracking-widest uppercase rounded-2xl border border-white/5 text-slate-500 transition-all">
              ABORT_SEQUENCE
            </motion.button>
            <motion.button type="submit" disabled={loading}
              whileHover={{ scale:1.02, backgroundColor:'var(--neon-violet)' }}
              whileTap={{ scale:0.98 }}
              className="flex-[2] py-4 rounded-2xl bg-violet-600 text-[10px] font-black tracking-[0.3em] uppercase text-white shadow-xl shadow-violet-600/20 flex items-center justify-center gap-3 transition-all">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {event ? 'PATCH_EXISTING_NODE' : 'COMMIT_ENTRY'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
