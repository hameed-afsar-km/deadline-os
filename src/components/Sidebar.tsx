'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Plus, X, Globe2 } from 'lucide-react';
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
    { label: 'Due Today', n: todayN,   c: 'text-cyan-400',   bg: 'bg-cyan-500/10' },
    { label: 'Overdue',   n: overdueN, c: 'text-rose-400',   bg: 'bg-rose-500/10' },
    { label: 'Pending',   n: pendingN, c: 'text-amber-400',  bg: 'bg-amber-500/10' },
    { label: 'Completed', n: doneN,    c: 'text-emerald-400',bg: 'bg-emerald-500/10' },
  ];

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={onClose}
            className="fixed inset-0 z-40 md:hidden bg-black/40 backdrop-blur-md" />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed left-0 top-[80px] h-[calc(100vh-80px)] z-40 w-72 flex flex-col font-sans border-r border-white/5 glass-panel',
          'md:translate-x-0 md:static md:z-auto transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile close */}
        <div className="flex items-center justify-between px-8 h-16 border-b border-white/5 md:hidden bg-white/[0.02]">
          <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Interface</span>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        {/* CTA */}
        <div className="p-6">
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor:'rgba(255,255,255,0.1)' }} whileTap={{ scale: 0.98 }}
            onClick={() => { onCreateEvent(); onClose(); }}
            className="w-full py-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all flex gap-3 items-center justify-center text-sm font-bold text-white tracking-wide"
          >
            <Plus size={18} strokeWidth={2.5} /> Deploy Node
          </motion.button>
        </div>

        {/* Nav */}
        <nav className="px-4 space-y-1.5 mt-2">
          <p className="px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">Main Circuit</p>
          {NAV.map(({ href, label, icon:Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} onClick={onClose}>
                <div
                  className={cn(
                    "flex items-center gap-4 px-6 py-3.5 text-sm font-bold transition-all rounded-2xl relative group overflow-hidden",
                    active ? "bg-white/[0.08] text-white border border-white/10" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02] border border-transparent"
                  )}
                >
                  {active && <motion.div layoutId="nav-bg" className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />}
                  <Icon size={18} className={cn("transition-all relative z-10", active ? "text-cyan-400" : "group-hover:text-zinc-400")}/>
                  <span className="relative z-10 tracking-wide">{label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mx-8 my-8 h-[1px] bg-gradient-to-r from-white/10 to-transparent" />

        {/* Stats */}
        <div className="px-6 flex-1 overflow-y-auto no-sb space-y-4">
          <p className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-3">System Overview</p>
          <div className="grid grid-cols-2 gap-3">
            {STATS.map(({ label, n, c, bg }) => (
              <motion.div key={label} whileHover={{ scale:1.02 }}
                className="p-5 flex flex-col gap-1.5 rounded-3xl border border-white/5 bg-white/[0.02] transition-colors hover:bg-white/[0.05]"
              >
                <div className={cn("w-2 h-2 rounded-full mb-1", bg.replace('/10', ''))} style={{ boxShadow:`0 0 10px ${c}` }} />
                <p className={cn("text-3xl font-black tracking-tighter", c)}>{n}</p>
                <p className="text-xs font-semibold text-zinc-500">{label}</p>
              </motion.div>
            ))}
          </div>

          <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.02] mt-6 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-zinc-400">
                <Globe2 size={14} className="text-cyan-400" /> Output
              </span>
              <span className="text-sm font-black text-white">{pct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/5 relative z-10">
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full relative"
              >
                <div className="absolute inset-0 bg-white/20 blur-[2px]" />
              </motion.div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 mt-4 text-center relative z-10">{doneN} / {events.length} Complete</p>
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-gradient-to-t from-black/20 to-transparent">
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl glass-panel">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-zinc-300">Synchronized</span>
          </div>
        </div>
      </aside>
    </>
  );
}
