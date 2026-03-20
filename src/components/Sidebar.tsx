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
    { label:'NOW',   n:todayN,   c:'#3B82F6'  },
    { label:'HOT',   n:overdueN, c:'#F43F5E'   },
    { label:'OPEN',  n:pendingN, c:'#F97316' },
    { label:'SYNK',  n:doneN,    c:'#10B981' },
  ];

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={onClose}
            className="fixed inset-0 z-40 md:hidden bg-black/60 backdrop-blur-sm" />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 w-72 flex flex-col border-r border-white/5',
          'md:translate-x-0 md:static md:z-auto transition-all duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ background: 'rgba(2, 6, 23, 0.4)', backdropFilter: 'blur(16px)' }}
      >
        {/* Mobile close */}
        <div className="flex items-center justify-between px-6 h-14 border-b border-white/10 md:hidden">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">// CONTROL</span>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        {/* CTA */}
        <div className="p-6">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => { onCreateEvent(); onClose(); }}
            className="w-full py-4 rounded-xl bg-violet-600 hover:bg-violet-500 shadow-[0_8px_20px_rgba(139,92,246,0.3)] transition-all flex gap-3 items-center justify-center text-sm font-black uppercase tracking-widest text-white"
          >
            <Plus size={20} strokeWidth={3} /> INITIALIZE_TASK
          </motion.button>
        </div>

        {/* Nav */}
        <nav className="px-4 space-y-1">
          <p className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">// MAIN_CHAIN</p>
          {NAV.map(({ href, label, icon:Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} onClick={onClose}>
                <motion.div whileHover={{ x:4 }}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3.5 text-sm font-bold transition-all rounded-xl relative",
                    active ? "bg-violet-600/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon size={20} className={cn("transition-all", active ? "text-violet-500" : "text-slate-500")}/>
                  {label}
                  {active && <motion.div layoutId="sidebar-active" className="absolute left-0 w-1 h-6 bg-violet-500 rounded-full" />}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="px-8 my-6 h-[1px] bg-white/5" />

        {/* Stats */}
        <div className="px-6 flex-1 overflow-y-auto no-sb space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">// NODE_TELEMETRY</p>
          <div className="grid grid-cols-2 gap-3">
            {STATS.map(({ label, n, c }) => (
              <motion.div key={label} whileHover={{ y: -4, borderColor: c }}
                className="p-4 flex flex-col gap-1 cursor-default transition-all border border-white/5 rounded-2xl bg-white/[0.02]"
              >
                <p className="text-3xl font-black leading-none tracking-tighter" style={{ color: c }}>{n}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</p>
              </motion.div>
            ))}
          </div>

          <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] mt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-violet-400">
                <Activity size={14} /> MOMENTUM
              </span>
              <span className="text-sm font-black text-violet-500 tracking-tighter">{pct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-900 border border-white/5">
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.5, ease: 'circOut' }}
                className="h-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500"
              />
            </div>
            <p className="text-[10px] font-bold text-slate-600 mt-3 tracking-widest uppercase">{doneN} UNITS / {events.length} TOTAL</p>
          </div>
        </div>

        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-orange-400 uppercase">System: Optimized</span>
          </div>
        </div>
      </aside>
    </>
  );
}
