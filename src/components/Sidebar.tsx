'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Plus, X, Activity } from 'lucide-react';
import { useEventStore } from '@/store/useEventStore';
import { isOverdue, isToday } from '@/utils/priority';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps { open:boolean; onClose:()=>void; onCreateEvent:()=>void; }

const NAV = [
  { href:'/dashboard', label:'Dashboard', icon:LayoutDashboard },
  { href:'/calendar',  label:'Calendar',  icon:Calendar },
];

export function Sidebar({ open, onClose, onCreateEvent }: SidebarProps) {
  const pathname = usePathname();
  const events   = useEventStore(s => s.events);

  const todayN   = events.filter(e => isToday(e) && e.status==='pending').length;
  const overdueN = events.filter(e => isOverdue(e)).length;
  const doneN    = events.filter(e => e.status==='completed').length;
  const pendingN = events.filter(e => e.status==='pending').length;
  const pct      = events.length ? Math.round((doneN/events.length)*100) : 0;

  const STATS = [
    { label:'TODAY',   n:todayN,   c:'var(--blue)'  },
    { label:'OVERDUE', n:overdueN, c:'var(--red)'   },
    { label:'PENDING', n:pendingN, c:'var(--amber)' },
    { label:'DONE',    n:doneN,    c:'var(--green)' },
  ];

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={onClose}
            className="fixed inset-0 z-40 md:hidden" style={{ background:'rgba(23,20,12,0.5)', backdropFilter:'blur(4px)' }} />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed left-0 top-14 h-[calc(100vh-3.5rem)] z-40 w-64 flex flex-col border-r',
          'md:translate-x-0 md:static md:z-auto transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ borderColor:'var(--ink-5)', background:'var(--paper-2)' }}
      >
        {/* Mobile close */}
        <div className="flex items-center justify-between px-4 py-3 border-b md:hidden" style={{ borderColor:'var(--ink-5)' }}>
          <span className="text-[9px] font-bold uppercase tracking-[.3em]" style={{ fontFamily:'var(--font-mono)', color:'var(--ink-4)' }}>Menu</span>
          <button onClick={onClose} style={{ color:'var(--ink-3)' }}><X size={16} /></button>
        </div>

        {/* CTA */}
        <div className="p-4">
          <motion.button
            whileHover={{ y:-2, boxShadow:'0 4px 0 rgba(100,10,0,0.35), 0 8px 20px rgba(200,34,10,0.2)' }}
            whileTap={{ y:1, boxShadow:'0 1px 0 rgba(100,10,0,0.4)' }}
            onClick={() => { onCreateEvent(); onClose(); }}
            className="btn-red w-full py-3 rounded-sm flex gap-2 items-center justify-center text-sm transition-all"
          >
            <Plus size={16} /> New Deadline
          </motion.button>
        </div>

        {/* Nav */}
        <nav className="px-3 space-y-0.5">
          <p className="px-3 py-2 text-[9px] font-bold uppercase tracking-[.3em]" style={{ fontFamily:'var(--font-mono)', color:'var(--ink-4)' }}>Navigation</p>
          {NAV.map(({ href, label, icon:Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} onClick={onClose}>
                <motion.div whileHover={{ x:3 }}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-colors relative"
                  style={ active
                    ? { color:'var(--red)', borderLeft:'2px solid var(--red)', background:'var(--red-l)' }
                    : { color:'var(--ink-2)', borderLeft:'2px solid transparent' }
                  }
                >
                  <Icon size={16} style={{ color: active ? 'var(--red)' : 'var(--ink-3)' }} />
                  {label}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="mx-4 my-4 h-px" style={{ background:'var(--ink-5)' }} />

        {/* Stats */}
        <div className="px-4">
          <p className="text-[9px] font-bold uppercase tracking-[.3em] mb-3" style={{ fontFamily:'var(--font-mono)', color:'var(--ink-4)' }}>Overview</p>
          <div className="grid grid-cols-2 gap-2">
            {STATS.map(({ label, n, c }) => (
              <motion.div key={label} whileHover={{ scale:1.04, borderColor:c }}
                className="paper-card p-4 flex flex-col gap-1 cursor-default transition-all" style={{ borderRadius:'3px' }}>
                <p className="text-3xl font-normal leading-none" style={{ fontFamily:'var(--font-serif)', color:c }}>{n}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest" style={{ fontFamily:'var(--font-mono)', color:'var(--ink-3)' }}>{label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Velocity */}
        <div className="p-4 mt-auto">
          <div className="paper-card p-4" style={{ borderRadius:'3px' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-bold uppercase tracking-[.25em] flex items-center gap-1.5" style={{ fontFamily:'var(--font-mono)', color:'var(--ink-3)' }}>
                <Activity size={11} style={{ color:'var(--red)' }} /> Velocity
              </span>
              <span className="text-sm font-bold" style={{ fontFamily:'var(--font-serif)', color:'var(--red)' }}>{pct}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-sm" style={{ background:'var(--ink-5)' }}>
              <motion.div
                initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:1.2, ease:'easeOut' }}
                className="h-full" style={{ background:'var(--red)' }}
              />
            </div>
            <p className="text-[10px] mt-2" style={{ fontFamily:'var(--font-mono)', color:'var(--ink-4)' }}>{doneN} of {events.length} complete</p>
          </div>
        </div>
      </aside>
    </>
  );
}
