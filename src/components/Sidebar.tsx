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
    { label: 'Due Today', n: todayN,   c: 'text-blue-600',   bg: 'bg-blue-50' },
    { label: 'Overdue',   n: overdueN, c: 'text-red-600',    bg: 'bg-red-50' },
    { label: 'Pending',   n: pendingN, c: 'text-amber-600',  bg: 'bg-amber-50' },
    { label: 'Completed', n: doneN,    c: 'text-emerald-600',bg: 'bg-emerald-50' },
  ];

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={onClose}
            className="fixed inset-0 z-40 md:hidden bg-slate-900/20 backdrop-blur-sm" />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed left-0 top-[72px] h-[calc(100vh-72px)] z-40 w-72 flex flex-col border-r border-slate-200 bg-white/70 backdrop-blur-xl',
          'md:translate-x-0 md:static md:z-auto transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile close */}
        <div className="flex items-center justify-between px-6 h-14 border-b border-slate-100 md:hidden">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Navigation</span>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 transition-colors"><X size={20} /></button>
        </div>

        {/* CTA */}
        <div className="p-6">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => { onCreateEvent(); onClose(); }}
            className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 shadow-md shadow-slate-900/10 transition-all flex gap-2 items-center justify-center text-sm font-semibold text-white"
          >
            <Plus size={18} strokeWidth={2.5} /> Create Deadline
          </motion.button>
        </div>

        {/* Nav */}
        <nav className="px-4 space-y-1">
          <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Main Menu</p>
          {NAV.map(({ href, label, icon:Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} onClick={onClose}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all rounded-xl relative group",
                    active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Icon size={18} className={cn("transition-all", active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")}/>
                  {label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="px-8 my-6 h-[1px] bg-slate-100" />

        {/* Stats */}
        <div className="px-6 flex-1 overflow-y-auto no-sb space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">My Overview</p>
          <div className="grid grid-cols-2 gap-3">
            {STATS.map(({ label, n, c, bg }) => (
              <div key={label}
                className={cn("p-4 flex flex-col gap-1 rounded-2xl border border-slate-100 transition-all hover:shadow-sm cursor-default bg-white")}
              >
                <div className={cn("w-2 h-2 rounded-full mb-1", bg.replace('bg-', 'bg-').replace('50', '400'))} />
                <p className={cn("text-2xl font-bold tracking-tight", c)}>{n}</p>
                <p className="text-xs font-medium text-slate-500">{label}</p>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white mt-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold flex items-center gap-2 text-slate-700">
                <Activity size={14} className="text-slate-400" /> Progress
              </span>
              <span className="text-sm font-bold text-slate-900">{pct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-blue-600 rounded-full"
              />
            </div>
            <p className="text-xs font-medium text-slate-500 mt-3 text-center">{doneN} of {events.length} Completed</p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-xs font-semibold text-slate-600">All systems online</span>
          </div>
        </div>
      </aside>
    </>
  );
}
