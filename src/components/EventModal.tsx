'use client';

import { DeadlineEvent } from '@/types';
import { createEvent, updateEvent } from '@/lib/firestore';
import { useUserStore } from '@/store/useUserStore';
import { X, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { Timestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { toDate } from '@/utils/dateHelpers';
import { Category, Priority, Status } from '@/types';

const CATS: Category[] = ['Study','Hackathon','Submission','Personal','Exam'];

export function EventModal({ event, onClose }: { event:DeadlineEvent|null; onClose:()=>void }) {
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title:'', description:'', deadline:'', category:'Study' as Category });

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
    if (!user) return toast.error('Not authenticated');
    setLoading(true);
    try {
      const data = {
        ...form,
        deadline:  Timestamp.fromDate(new Date(form.deadline)),
        reminders: [] as string[],
        priority:  'auto' as Priority,
        status:    (event ? event.status : 'pending') as Status,
      };
      if (event) { await updateEvent(event.id, data); toast.success('Deadline updated.'); }
      else       { await createEvent(user.uid, data); toast.success('Deadline created.'); }
      onClose();
    } catch { toast.error('Save failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        onClick={onClose} className="absolute inset-0"
        style={{ background:'rgba(23,20,12,0.35)', backdropFilter:'blur(6px)' }} />

      {/* Modal — drops in like a piece of paper */}
      <motion.div
        initial={{ opacity:0, y:-20, rotate:-1.5 }}
        animate={{ opacity:1, y:0, rotate:0 }}
        exit={{ opacity:0, y:16, scale:.97 }}
        transition={{ duration:.4, ease:[.22,1,.36,1] }}
        className="relative z-10 w-full max-w-lg paper-card overflow-hidden"
        style={{ borderRadius:'3px' }}>

        {/* Red top stripe */}
        <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background:'var(--red)' }} />

        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b" style={{ borderColor:'var(--ink-5)' }}>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.3em] mb-1" style={{ fontFamily:'var(--font-mono)', color:'var(--red)' }}>
              {event ? '§ Edit deadline' : '§ New deadline'}
            </p>
            <h2 className="text-2xl font-normal" style={{ fontFamily:'var(--font-serif)' }}>
              {event ? 'Update record' : 'Add to queue'}
            </h2>
          </div>
          <motion.button whileHover={{ scale:1.1, backgroundColor:'var(--paper-2)' }} whileTap={{ scale:.9 }}
            onClick={onClose} className="p-2 rounded-sm transition-all" style={{ color:'var(--ink-3)' }}>
            <X size={20} />
          </motion.button>
        </div>

        <form onSubmit={submit} className="px-7 py-6 space-y-5">
          {/* Title */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider block mb-2" style={{ fontFamily:'var(--font-mono)', color:'var(--ink-3)' }}>
              Label
            </label>
            <input type="text" required autoFocus value={form.title} onChange={e=>setForm({...form,title:e.target.value})}
              placeholder="e.g. Submit final prototype"
              className="field-ink w-full px-4 py-3" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider block mb-2" style={{ fontFamily:'var(--font-mono)', color:'var(--ink-3)' }}>
                Deadline
              </label>
              <input type="datetime-local" required value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})}
                className="field-ink w-full px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider block mb-2" style={{ fontFamily:'var(--font-mono)', color:'var(--ink-3)' }}>
                Category
              </label>
              <select value={form.category} onChange={e=>setForm({...form,category:e.target.value as Category})}
                className="field-ink w-full px-3 py-2.5 text-sm cursor-pointer appearance-none">
                {CATS.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider block mb-2" style={{ fontFamily:'var(--font-mono)', color:'var(--ink-3)' }}>
              Notes
            </label>
            <textarea rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}
              placeholder="Links, references, additional context..."
              className="field-ink w-full px-4 py-3 resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor:'var(--ink-5)' }}>
            <motion.button type="button" onClick={onClose} disabled={loading}
              whileHover={{ borderColor:'var(--ink-2)' }} whileTap={{ scale:.96 }}
              className="btn-ink px-5 py-2.5 text-sm">Cancel</motion.button>
            <motion.button type="submit" disabled={loading}
              whileHover={{ y:-2, boxShadow:'0 4px 0 rgba(100,10,0,0.35)' }}
              whileTap={{ y:1 }}
              className="btn-red inline-flex items-center gap-2 px-6 py-2.5 text-sm">
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {event ? 'Save changes' : 'Add deadline'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
