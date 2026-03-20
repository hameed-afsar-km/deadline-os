'use client';

import { DeadlineEvent } from '@/types';
import { getEffectivePriority, isOverdue } from '@/utils/priority';
import { updateEvent, deleteEvent } from '@/lib/firestore';
import { CheckCircle2, Clock, Pencil, Trash2, Loader2, Calendar } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Timestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';

const P_CFG: Record<string,{ c:string; bg:string; label:string; bar:string }> = {
  high:   { c:'var(--red)',   bg:'var(--red-l)',  label:'CRITICAL', bar:'var(--red)' },
  medium: { c:'var(--amber)', bg:'rgba(179,84,0,.07)',  label:'HIGH',     bar:'var(--amber)' },
  low:    { c:'var(--green)', bg:'rgba(26,102,53,.07)', label:'NORMAL',   bar:'var(--green)' },
  auto:   { c:'var(--blue)',  bg:'rgba(26,68,180,.07)', label:'AUTO',     bar:'var(--blue)' },
};

const CAT_ICON: Record<string,string> = { Study:'📚', Hackathon:'⚡', Submission:'📨', Personal:'🌿', Exam:'✏️' };

function fmt(dl:unknown):string {
  try {
    const d = dl instanceof Timestamp ? dl.toDate() : new Date(dl as string);
    const ms = d.getTime()-Date.now();
    if (ms<=0) return 'OVERDUE';
    const h=Math.floor(ms/3_600_000), dy=Math.floor(h/24);
    return dy>0 ? `${dy}D ${h%24}H` : `${h}H ${Math.floor((ms%3_600_000)/60_000)}M`;
  } catch { return '--'; }
}

function fmtDate(dl:unknown):string {
  try {
    const d = dl instanceof Timestamp ? dl.toDate() : new Date(dl as string);
    return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(d);
  } catch { return ''; }
}

function pct(dl:unknown):number {
  try {
    const end = dl instanceof Timestamp ? dl.toDate() : new Date(dl as string);
    const base = new Date(end.getTime()-7*86400000);
    return Math.min(100, Math.max(0, ((Date.now()-base.getTime())/(end.getTime()-base.getTime()))*100));
  } catch { return 0; }
}

export function EventCard({ event, onEdit }: { event:DeadlineEvent; onEdit:(e:DeadlineEvent)=>void }) {
  const [loading, setLoading] = useState(false);

  const p    = getEffectivePriority(event);
  const over = isOverdue(event);
  const done = event.status === 'completed';
  const cfg  = P_CFG[p] ?? P_CFG.auto;
  const prog = pct(event.deadline);
  const icon = CAT_ICON[event.category] ?? '📌';

  const toggle = async () => {
    setLoading(true);
    try { await updateEvent(event.id, { status:done?'pending':'completed' }); }
    catch { toast.error('Update failed'); }
    finally { setLoading(false); }
  };
  const remove = async () => {
    if (!confirm('Delete?')) return;
    setLoading(true);
    try { await deleteEvent(event.id); }
    catch { toast.error('Delete failed'); }
    finally { setLoading(false); }
  };

  /* ── The "drop onto desk" entrance animation ── */
  return (
    <motion.div
      layout
      initial={{ opacity:0, y:-12, rotate: Math.random() * 2 - 1 }}
      animate={{ opacity: done?.55:1, y:0, rotate:0, scale:1, filter:done?'grayscale(0.5)':'none' }}
      exit={{ opacity:0, scale:.92 }}
      transition={{ duration:.5, ease:[.22,1,.36,1] }}
      whileHover={ done ? {} : {
        y: -7,
        boxShadow: '0 4px 8px rgba(23,20,12,0.1), 0 12px 32px rgba(23,20,12,0.12), 0 28px 56px rgba(23,20,12,0.08)',
      }}
      className="group relative flex flex-col gap-3.5 p-5 paper-card cursor-default"
      style={{ borderRadius:'3px', transition:'box-shadow .3s, transform .3s' }}
    >
      {/* Red priority top stripe */}
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-sm"
        style={{ background: over&&!done ? 'var(--red)' : cfg.c, opacity: done ? .3 : 1 }} />

      {/* Overdue stamp — kinetic rotation into place */}
      {over && !done && (
        <motion.span
          initial={{ opacity:0, scale:1.8, rotate:-20 }}
          animate={{ opacity:1, scale:1, rotate:-6 }}
          transition={{ duration:.5, ease:[.22,1,.36,1], delay:.2 }}
          className="stamp absolute top-4 right-4"
          style={{ transformOrigin:'center' }}
        >
          OVERDUE
        </motion.span>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 pr-16">
        <span className="tag-ink">{icon} {event.category}</span>
        <span className="text-[9px] font-black uppercase tracking-[.12em] px-2 py-1 rounded-sm"
          style={{ background:cfg.bg, color:cfg.c, fontFamily:'var(--font-mono)', border:`1px solid ${cfg.c}25` }}>
          {cfg.label}
        </span>
      </div>

      {/* Title */}
      <div>
        <h3 className={`text-[1.05rem] font-normal leading-snug line-clamp-2 ${done?'line-through opacity-50':''}`}
          style={{ fontFamily:'var(--font-serif)', color: over&&!done ? 'var(--red)' : 'var(--ink)' }}>
          {event.title}
        </h3>
        {event.description && (
          <p className="text-xs leading-relaxed mt-1.5 line-clamp-2" style={{ color:'var(--ink-3)' }}>
            {event.description}
          </p>
        )}
      </div>

      {/* Progress rule */}
      {!done && (
        <div className="h-0.5 overflow-hidden" style={{ background:'var(--ink-5)' }}>
          <motion.div
            initial={{ width:0 }} animate={{ width:`${prog}%` }} transition={{ duration:1, ease:'easeOut' }}
            className="h-full"
            style={{ background: over ? 'var(--red)' : prog>80 ? 'var(--amber)' : cfg.bar }}
          />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor:'var(--ink-5)' }}>
        <div>
          <p className="text-[10px] font-medium flex items-center gap-1" style={{ fontFamily:'var(--font-mono)', color:'var(--ink-4)' }}>
            <Calendar size={9} /> {fmtDate(event.deadline)}
          </p>
          <p className="text-xs font-black flex items-center gap-1.5 mt-0.5"
            style={{ fontFamily:'var(--font-mono)', color: over&&!done ? 'var(--red)' : done ? 'var(--ink-4)' : 'var(--ink)' }}>
            <Clock size={10} /> {fmt(event.deadline)}
          </p>
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button whileHover={{ scale:1.15, color:'var(--ink)' }} whileTap={{ scale:.9 }}
            onClick={() => onEdit(event)} className="p-1.5 rounded-sm" style={{ color:'var(--ink-3)' }}>
            <Pencil size={13} />
          </motion.button>
          <motion.button whileHover={{ scale:1.15, color:'var(--red)' }} whileTap={{ scale:.9 }}
            onClick={remove} disabled={loading} className="p-1.5 rounded-sm" style={{ color:'var(--ink-3)' }}>
            <Trash2 size={13} />
          </motion.button>
          <motion.button
            whileHover={ done ? {} : { scale:1.04 }} whileTap={{ scale:.95 }}
            onClick={toggle} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[11px] font-bold transition-all border"
            style={ done
              ? { border:'1px solid var(--ink-5)', color:'var(--ink-3)', background:'transparent' }
              : { background:'var(--paper-2)', borderColor:'var(--ink-5)', color:'var(--green)' }
            }
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
            {done ? 'Undo' : 'Done'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
