'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CalendarDays, Plus, X } from 'lucide-react';
import { useEventStore } from '@/store/useEventStore';
import { isOverdue, isToday } from '@/utils/priority';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onCreateEvent: () => void;
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/calendar',  label: 'Calendar',   icon: CalendarDays },
];

export function Sidebar({ open, onClose, onCreateEvent }: SidebarProps) {
  const pathname = usePathname();
  const events   = useEventStore(s => s.events);

  const todayN   = events.filter(e => isToday(e) && e.status === 'pending').length;
  const overdueN = events.filter(e => isOverdue(e)).length;
  const doneN    = events.filter(e => e.status === 'completed').length;
  const totalN   = events.length;
  const pct      = totalN ? Math.round((doneN / totalN) * 100) : 0;

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 md:hidden bg-black/60 backdrop-blur-md"
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <aside className={cn(
        'fixed md:static left-0 top-[64px] h-[calc(100vh-64px)] md:h-auto z-40 w-[240px] flex flex-col',
        'glass border-r border-white/[0.04] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'md:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}>

        {/* Mobile close */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04] md:hidden">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Navigation</span>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X size={16} /></button>
        </div>

        {/* Create task button */}
        <div className="p-4 border-b border-white/[0.04]">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => { onCreateEvent(); onClose(); }}
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-[10px] font-black text-white grad-accent glow-accent uppercase tracking-[0.2em]"
          >
            <Plus size={15} /> Initialize Unit
          </motion.button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto no-sb">
          <p className="px-3 mb-3 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">Core Protocol</p>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} onClick={onClose}>
                <motion.div whileHover={{ x: 2 }} transition={{ type: 'spring', stiffness: 400 }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all relative group',
                    active
                      ? 'bg-cyan-500/10 text-white border border-cyan-500/10'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]'
                  )}>
                  {active && <motion.div layoutId="sidebar-active" className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-cyan-500 rounded-r-sm glow-accent" />}
                  <Icon size={14} className={cn('transition-colors', active ? 'text-cyan-400' : 'group-hover:text-cyan-500')} />
                  {label}
                </motion.div>
              </Link>
            );
          })}

          {/* ── Stats Summary ── */}
          <div className="mt-10 space-y-2">
            <p className="px-3 mb-4 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">Data Analytics</p>

            {[
              { label: 'Current Load',  val: todayN,   color: '#06B6D4' },
              { label: 'Criticial Gap', val: overdueN, color: '#F43F5E' },
              { label: 'Processed',     val: doneN,    color: '#10B981' },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter group-hover:text-zinc-400">{label}</span>
                </div>
                <span className="text-[11px] font-mono font-black text-white">{val.toString().padStart(2, '0')}</span>
              </div>
            ))}

            {/* Progress bar */}
            <div className="px-3 pt-6 relative group">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Efficiency Rate</span>
                <span className="text-[11px] font-black text-cyan-400 tabular-nums">{pct}%</span>
              </div>
              <div className="h-1 bg-white/[0.03] rounded-sm overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                  className="h-full rounded-sm grad-accent relative shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                />
              </div>
              <p className="text-[9px] text-zinc-600 mt-2 text-right font-bold font-mono tracking-tighter">{doneN} / {totalN} UNITS</p>
              
              <div className="absolute -top-1 right-2 w-4 h-[1px] bg-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.04] bg-black/20">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg glass border border-white/[0.02]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse glow-em" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Relay Status</span>
              <span className="text-[8px] font-bold text-zinc-600 uppercase">FIREBASE_V9_STABLE</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
