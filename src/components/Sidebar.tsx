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
            className="fixed inset-0 z-40 md:hidden bg-black/50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <aside className={cn(
        'fixed md:static left-0 top-[64px] h-[calc(100vh-64px)] md:h-auto z-40 w-[260px] flex flex-col',
        'glass border-r border-white/[0.06] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
        'md:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}>

        {/* Mobile close */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] md:hidden">
          <span className="text-xs font-bold uppercase tracking-widest text-[--c-muted]">Menu</span>
          <button onClick={onClose} className="text-[--c-muted] hover:text-white transition-colors"><X size={18} /></button>
        </div>

        {/* Create task button */}
        <div className="p-4 border-b border-white/[0.06]">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => { onCreateEvent(); onClose(); }}
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-bold text-white grad-accent glow-accent hover:opacity-90 transition-opacity"
          >
            <Plus size={17} /> New Task
          </motion.button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-sb">
          <p className="px-3 mb-3 text-[0.65rem] font-bold uppercase tracking-widest text-[--c-muted]">Navigation</p>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} onClick={onClose}>
                <motion.div whileHover={{ x: 2 }} transition={{ type: 'spring', stiffness: 400 }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all relative',
                    active
                      ? 'bg-violet-500/15 text-white border border-violet-500/20'
                      : 'text-[--c-muted] hover:text-white hover:bg-white/[0.04]'
                  )}>
                  {active && <motion.div layoutId="sidebar-active" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-violet-500 rounded-r-full glow-accent" />}
                  <Icon size={16} className={active ? 'text-violet-400' : ''} />
                  {label}
                </motion.div>
              </Link>
            );
          })}

          {/* ── Stats Summary ── */}
          <div className="mt-8 space-y-2">
            <p className="px-3 mb-3 text-[0.65rem] font-bold uppercase tracking-widest text-[--c-muted]">Overview</p>

            {[
              { label: 'Due Today',  val: todayN,   color: '#0EA5E9' },
              { label: 'Overdue',    val: overdueN, color: '#F43F5E' },
              { label: 'Completed',  val: doneN,    color: '#10B981' },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                  <span className="text-xs font-medium text-[--c-muted]">{label}</span>
                </div>
                <span className="text-sm font-bold text-white">{val}</span>
              </div>
            ))}

            {/* Progress bar */}
            <div className="px-3 pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[--c-muted]">Completion</span>
                <span className="text-xs font-bold text-white">{pct}%</span>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                  className="h-full rounded-full grad-accent"
                />
              </div>
              <p className="text-[0.65rem] text-[--c-muted] mt-2 text-right font-medium">{doneN} / {totalN} tasks</p>
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl glass-hi border border-white/[0.06]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: '0 0 8px #10B981' }} />
            <span className="text-xs font-semibold text-[--c-muted]">Synced · Firebase</span>
          </div>
        </div>
      </aside>
    </>
  );
}
